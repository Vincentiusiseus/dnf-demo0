// Node libs
import { Worker, MessageChannel, isMainThread, parentPort, workerData } from "worker_threads"
import * as path from "path"

class WorkerManager {
    workers:{ [id:number]: Worker }
    value:number

    constructor() {
        this.workers = {}
        this.value = 0
    }

    async prepareArgs(thread_id:number):Promise<any> {}

    async handleResponse(thread_id:number, response:any) {}

    async postMessage(worker:Worker) {
        const args = await this.prepareArgs(worker.threadId)
        worker.postMessage(args)
    }

    async startWorker(worker_script_path:string) {
        const worker = new Worker(worker_script_path)
        this.workers[worker.threadId] = worker

        worker.on("message", async (response) => {
            await this.handleResponse(worker.threadId, response)
            await this.postMessage(worker)
        })

        await this.postMessage(worker)
    }
}

class IncValue extends WorkerManager {
    async prepareArgs(thread_id:number): Promise<number> {
        const value = this.value
        const min = 500
        const max = 5000
        const random_wait_ms = Math.random() * (max - min) + min;
        const expected_time = new Date(new Date().getTime() + random_wait_ms).toISOString()
        this.value++
        console.log(`[${new Date().toISOString()}][Main][${thread_id}] Value ${value} with setTimeout ${random_wait_ms} (expected time ${expected_time})`)
        await new Promise((res,rej) => {
            setTimeout(() => {
               res(0) 
            }, random_wait_ms);
        })
        return value
    }
    
    async handleResponse(thread_id:number, response: any): Promise<void> {
        console.log(`[${new Date().toISOString()}][Main][${thread_id}] Received response`)
    }
}

function main() {
    const worker_manager = new IncValue()
    worker_manager.startWorker(path.join(__dirname, "./worker.js"))
    worker_manager.startWorker(path.join(__dirname, "./worker.js"))
    worker_manager.startWorker(path.join(__dirname, "./worker.js"))
    worker_manager.startWorker(path.join(__dirname, "./worker.js"))
    worker_manager.startWorker(path.join(__dirname, "./worker.js"))
    worker_manager.startWorker(path.join(__dirname, "./worker.js"))
}
main()