// Node libs
import { Worker } from "worker_threads"
import * as path from "path"

// My libs
import { TokenBucket } from "./token-bucket"

type CanHandleResponse = { handleResponse: (response:any, worker:Worker) => Promise<any> }

export class WorkerManager {
    workers:{[id:number]:Worker} = {}
    token_bucket:TokenBucket
    constructor(
        public inst:CanHandleResponse,
        public max_workers:number,
        public iterators:AsyncIterator<any>,
        public max_tokens:number,
        public max_time_s:number
    ) {
        this.token_bucket = new TokenBucket(max_tokens, max_time_s)
    }

    async waitFunction(id:number) {
        let wait_count = 0
        while(true) {
            const token_left:number = this.token_bucket.bucket

            if(token_left == 0) {
                const wait_ms = this.token_bucket.max_time_s * 1000
                console.log(`[${new Date().toISOString()}][${id}] waiter function (${wait_ms}ms) - token_left '${token_left} || wait count '${++wait_count}'`)
                const actual_start_dt = new Date()
                await new Promise((res) => {
                    // setTimeout(() => {
                    //     const actual_end_dt = new Date()
                    //     console.log(`[${new Date().toISOString()}][${this.id}] Actual wait: ${actual_end_dt.getTime() - actual_start_dt.getTime()}ms`)
                    //     res(0)
                    // }, wait_ms)

                    setTimeout(() => res(0), wait_ms)
                })
                this.token_bucket.refillTokenIfPossible()
            }
            else {
                break
            }
        }
    }

    async postMessage(id:any) {
        const param = await this.iterators.next()
        if(param.done) {
            console.log(`============ FINISHED ITERATING =============`)
        }
        const worker = this.workers[id]
        await this.waitFunction(id)
        this.token_bucket.useToken()
        worker.postMessage(param.value)
    }
    
    async startNewWorker() {
        const worker = new Worker(path.join(__dirname, "../worker.js"))
        const id = worker.threadId
        this.workers[id] = worker
        worker.on("message", async (response:Response) => {
            await this.inst.handleResponse(response, worker)
            await this.postMessage(id)
        })
        await this.postMessage(id)
    }

    async start() {
        let count = 0
        while(++count <= this.max_workers) {
            await this.startNewWorker()
            console.log(`Started worker ${count}`)
            if(count < this.max_workers) {
                await new Promise((res) => setTimeout(() => res(0), 500))
            }
        }
        console.log(`Ran all ${this.max_workers} workers`)
    }
}