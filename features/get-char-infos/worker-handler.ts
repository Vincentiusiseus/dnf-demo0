// Node libs
import { Worker } from "worker_threads"
import * as path from "path"

export abstract class WorkerHandler<Param=any, Response=any> {
    id:number
    worker:Worker
    constructor(public iterator:AsyncIterator<Param>) {
        this.worker = new Worker(path.join(__dirname, "./worker.js"))
        this.id = this.worker.threadId
    }

    async postMessage() {
        const iter_result = await this.iterator.next()
        if(iter_result.done) {
            return false
        }
        const value = iter_result.value
        this.worker.postMessage(value)
    }

    abstract handleResponse(response:Response):Promise<void>

    setupHandlers() {
        this.worker.on("message", async (response:Response) => {
            await this.handleResponse(response)
            await this.postMessage()
        })
    }

    async start() {
        this.setupHandlers()
        await this.postMessage()
    }
}
