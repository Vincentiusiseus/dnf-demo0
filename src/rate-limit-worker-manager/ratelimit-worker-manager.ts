// Node libs
import { setEnvironmentData, Worker } from "worker_threads"
import * as path from "path"

// NPM libs
import * as _ from "lodash"

// My libs
import { TokenBucket } from "./token-bucket"
import { main_logger as log } from "./logger"

// My types
import type { Handler, Options, WorkerResponse, WorkerResponseError, WorkerResponseSuccess } from "./types"

const option_defaults:Options = {
    worker_start_interval_ms: 500,
    worker_wait_range: [0,0]
}

export class RatelimitWorkerManager<MessageData=any, ResData=any, ResError=any> {
    workers:{[id:number]:Worker} = {}
    token_bucket:TokenBucket

    iter_done:boolean = false
    workers_started_count:number = 0

    workers_handle_count:any = {}

    constructor(
        public inst:Handler<ResData,ResError>,
        public worker_file_path:string,
        public max_workers:number,
        public iterators:AsyncIterator<MessageData>,
        public max_tokens:number,
        public max_time_s:number,
        public options:Options
    ) {
        _.defaultsDeep(this.options, option_defaults)

        this.token_bucket = new TokenBucket(max_tokens, max_time_s)
    }

    /**
     * 
     * @param worker_id Need this for a log message. So, pass id of a worker instead of a whole Worker instance.
     */
    async waitIfNeeded(worker_id:number) {
        let wait_count = 0
        while(true) {
            const token_left:number = this.token_bucket.bucket

            if(token_left == 0) {
                const wait_ms = this.token_bucket.max_time_s * 1000
                log.info({
                    worker_id,
                    message: `waiter function (${wait_ms}ms) - token_left '${token_left} || wait count '${++wait_count}'`
                })

                const actual_start_dt = new Date()
                await new Promise((res) => {
                    setTimeout(() => {
                        const actual_end_dt = new Date()
                        const actual_wait = actual_end_dt.getTime() - actual_start_dt.getTime()
                        log.info({
                            worker_id,
                            message: `Actual wait: ${actual_wait}ms`
                        })
                        res(0)
                    }, wait_ms)
                })
                this.token_bucket.refillTokenIfPossible()
            }
            else {
                break
            }
        }
    }

    async handleIteratorDone(worker:Worker) {
        const worker_id = worker.threadId
        /**
         * 2023-01-21 16:30
         * `exit_code == 1` means it was terminated. https://nodejs.org/api/worker_threads.html#event-exit
         */
        const exit_code = await worker.terminate()
        log.info({
            worker_id,
            message: `Worker was terminated with exit code (${exit_code})`
        })
        delete this.workers[worker_id]
        if(Object.keys(this.workers).length == 0) {
            log.info(`All workers had been terminated.`)
            log.info(`(${this.workers_started_count}/${this.max_workers}) workers had been STARTED AND been terminated.`)
            log.info("%o", this.workers_handle_count)
            this.inst.handleAllWorkersTerminated()
        }
    }

    /**
     * 제일 바쁜 함수.
     * 
     * `postMessage`가 메인이지만 generator가 `done` 이면 worker 중단시킴. generator가 값을 줬는데
     * rate limit에 막히면 일정시간 동안 기다림.
     * @param worker 
     * @returns 
     */
    async postMessage(worker:Worker) {
        const iter_result = await this.iterators.next()
        const is_done = iter_result.done
        const worker_id = worker.threadId

        log.info("Post message wait if needed", iter_result)
        if(is_done) {
            this.iter_done = is_done
            log.info(`Generator is 'done'. Worker ${worker_id} will be termiated.`)
            await this.handleIteratorDone(worker)
            return
        }
        const value:MessageData = iter_result.value
        await this.waitIfNeeded(worker_id)
        this.token_bucket.useToken()
        this.workers_handle_count[worker_id] = worker_id in this.workers_handle_count ? this.workers_handle_count[worker_id] + 1 : 1
        worker.postMessage(value)
    }
    
    async startNewWorker() {
        setEnvironmentData("worker_wait_range", this.options.worker_wait_range)
        const worker = new Worker(path.join(__dirname, "./worker.js"), { env: { worker_fp: this.worker_file_path } })
        this.workers_started_count++
        log.info(`Started worker. Count: ${this.workers_started_count}`, worker.threadId)

        const id = worker.threadId
        this.workers[id] = worker
        worker.on("message", async (response:WorkerResponse<ResData, ResError>) => {
            log.info("Got response: %o", response, { worker_id: id })
            if("data" in response) {
                await this.inst.handleResponse(response.data, worker)
            }
            else if("error" in response) {
                await this.inst.handleError(response.error, worker)
            }
            await this.postMessage(worker)
        })
        worker.on("exit", (exit_code) => {
            log.info(`Worker (${worker.threadId}) exitted with code ${exit_code}`)
        })
        await this.postMessage(worker)
        return worker
    }

    async start() {
        log.info(`Max workers: ${this.max_workers}`)
        while(this.workers_started_count < this.max_workers) {
            if(this.iter_done) {
                log.info(`Iterator finished iterating. Stop starting new workers. Started workers so far: ${this.workers_started_count}`)
                break
            }

            this.startNewWorker()
            if(this.workers_started_count < this.max_workers) {
                await new Promise((res) => setTimeout(() => res(0), this.options.worker_start_interval_ms))
            }
        }
        log.info(`Ran ${this.workers_started_count}/${this.max_workers} workers`)
    }
}