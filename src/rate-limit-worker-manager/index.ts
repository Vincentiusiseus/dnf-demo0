// Node libs
import { Worker } from "worker_threads"
import * as path from "path"

// My libs
import { TokenBucket } from "./token-bucket"

export type Handler<Response> = {
    handleResponse: (response:Response, worker:Worker) => Promise<any>
    handleAllWorkersTerminated: () => any
}

export type Options = {
    worker_start_interval_ms:number
}

export class RatelimitWorkerManager<Response=any> {
    workers:{[id:number]:Worker} = {}
    token_bucket:TokenBucket

    iter_done:boolean = false
    workers_started_count:number = 0

    constructor(
        public inst:Handler<Response>,
        public worker_file_path:string,
        public max_workers:number,
        public iterators:AsyncIterator<any>,
        public max_tokens:number,
        public max_time_s:number,
        public options:Options = { worker_start_interval_ms: 500 }
    ) {
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
                console.log(`[${new Date().toISOString()}][${worker_id}] waiter function (${wait_ms}ms) - token_left '${token_left} || wait count '${++wait_count}'`)

                const actual_start_dt = new Date()
                await new Promise((res) => {
                    setTimeout(() => {
                        const actual_end_dt = new Date()
                        const actual_wait = actual_end_dt.getTime() - actual_start_dt.getTime()
                        console.log(`[${new Date().toISOString()}][${worker_id}] Actual wait: ${actual_wait}ms`)
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
        console.log(`[${new Date().toISOString()}][${worker_id}] Worker was terminated with exit code (${exit_code})`)
        delete this.workers[worker_id]
        if(Object.keys(this.workers).length == 0) {
            console.log(`[${new Date().toISOString()}] All workers had been terminated.`)
            if(this.workers_started_count == this.max_workers) {
                console.log(`[${new Date().toISOString()}] All workers had been STARTED AND been terminated.`)
            }
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
        const value = iter_result.value
        const is_done = iter_result.done
        console.log("Post message wait if needed", iter_result)
        if(is_done) {
            this.iter_done = is_done
            console.log(`Generator is 'done'. Worker ${worker.threadId} will be termiated.`)
            await this.handleIteratorDone(worker)
            return
        }
        await this.waitIfNeeded(worker.threadId)
        this.token_bucket.useToken()
        worker.postMessage(value)
    }
    
    async startNewWorker() {
        const worker = new Worker(path.join(__dirname, "./worker.js"), { env: { worker_fp: this.worker_file_path } })
        const id = worker.threadId
        this.workers[id] = worker
        worker.on("message", async (response:Response) => {
            await this.inst.handleResponse(response, worker)
            await this.postMessage(worker)
        })
        worker.on("exit", (exit_code) => {
            console.log(`Worker (${worker.threadId}) exitted with code ${exit_code}`)
        })
        await this.postMessage(worker)
        return worker
    }

    async start() {
        while(++this.workers_started_count <= this.max_workers) {
            if(this.iter_done) {
                console.log(`Iterator finished iterating. Stop starting new workers. Started workers so far: ${this.workers_started_count}`)
                break
            }
            const worker = await this.startNewWorker()
            console.log(`Started worker. Count: ${this.workers_started_count}`, worker.threadId)
            if(this.workers_started_count < this.max_workers) {
                await new Promise((res) => setTimeout(() => res(0), this.options.worker_start_interval_ms))
            }
        }
        console.log(`Ran ${this.workers_started_count}/${this.max_workers} workers`)
    }
}