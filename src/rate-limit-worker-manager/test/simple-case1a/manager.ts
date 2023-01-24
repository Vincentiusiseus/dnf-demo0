// Node libs
import { Worker } from "worker_threads"
import * as path from "path"

// My libs
import { RatelimitWorkerManager } from "../../ratelimit-worker-manager"

// My types
import type { Handler, Options, WorkerResponse, WorkerResponseError, WorkerResponseSuccess } from "../../types"

class MyHandler implements Handler<any,any> {
    handleAllWorkersTerminated():any {
        console.log("All done")
    }

    async handleResponse(response: any, worker: Worker):Promise<any> {
        console.log(`Got response`, response)
    }

    async handleError(error: any, worker: Worker):Promise<any> {
        return
    }
}

async function * generator() {
    let count = 0
    while(++count <= 100) {
        yield count
    }
}

async function main() {
    const my_handler = new MyHandler()
    const worker_path = path.join(__dirname, "./my_worker.ts")
    /**
     * 2023-01-24 20:26
     * Greater the 
     */
    const manager = new RatelimitWorkerManager(my_handler, worker_path, 8, generator(), 5, 1, { worker_start_interval_ms: 1000 })
    await manager.start()
}
main()

