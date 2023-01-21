// Not libs
import * as path from "path"

// Node type
import type { Worker } from "worker_threads"

// My libs
import { RatelimitWorkerManager } from "../index"

// My types
import type { Handler } from "../index"

class MyHandler implements Handler<any> {
    handleAllWorkersTerminated() {
        console.log(`My handler. ALL workers were terminated`)
    }

    async handleResponse(response: any, worker: Worker) {
        console.log("handlerResponse:", response, worker.threadId)
    }
}

async function main() {
    const handler = new MyHandler()
    const worker_fp = path.join(__dirname, "./test1_worker.ts")
    const gen = async function* () {
        let count = 0
        for(const a of Array(5)) {
            count++
            
            console.log("Generator output", count)
            yield count
        }
    }
    const worker_manager = new RatelimitWorkerManager(handler, worker_fp, 10, gen(), 100, 1)
    worker_manager.start()
}
main()