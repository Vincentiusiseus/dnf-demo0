// Node libs
import { Worker } from "worker_threads"
import * as path from "path"

type CanHandleResponse = { handleResponse: (response:any, worker:Worker) => Promise<any> }

export class WorkerManager {
    workers:{[id:number]:Worker} = {}
    constructor(public inst:CanHandleResponse, public max_workers:number, public iterators:AsyncIterator<any>) {}

    async postMessage(id:any) {
        const param = await this.iterators.next()
        const worker = this.workers[id]
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
    }
}