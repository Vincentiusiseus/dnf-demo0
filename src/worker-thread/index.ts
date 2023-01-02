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

    startWorker(worker_script_path:string) {
        const worker = new Worker(worker_script_path)
        this.workers[worker.threadId] = worker

        const min = 500
        const max = 3000
        const random_wait_ms = Math.random() * (max - min) + min;
        console.log(`[${new Date().toISOString()}][Main] Send message to ${worker.threadId} after ${random_wait_ms}`)
        setTimeout(() => {
            worker.postMessage(this.value++)
        }, random_wait_ms)

        worker.on("message", (msg) => {
            console.log(`[${new Date().toISOString()}][Main] Received msg ${msg} from ${worker.threadId}`)
            worker.postMessage(this.value++)
        })
    }
}

function main() {
    const worker_manager = new WorkerManager()
    worker_manager.startWorker(path.join(__dirname, "./worker.js"))
    worker_manager.startWorker(path.join(__dirname, "./worker.js"))
    worker_manager.startWorker(path.join(__dirname, "./worker.js"))
    worker_manager.startWorker(path.join(__dirname, "./worker.js"))
    worker_manager.startWorker(path.join(__dirname, "./worker.js"))
    worker_manager.startWorker(path.join(__dirname, "./worker.js"))
}
main()