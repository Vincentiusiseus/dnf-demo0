// Node libs
import { getEnvironmentData } from "worker_threads"

// My libs
import { WorkerResponse } from "../../types"
import { BaseWorker } from "../../base-worker"
import {thread_logger as log } from "../../logger"

class MyWorker extends BaseWorker<any, any, any> {
    async defaultMessageHandler(args:any): Promise<WorkerResponse<any, any>> {
        const worker_wait_range:any = getEnvironmentData("worker_wait_range")
        console.log(`Wait range ${worker_wait_range}`)
        const min = worker_wait_range[0]
        const max = worker_wait_range[1]
        const wait_s = Math.random() * (max - min) + min

        await new Promise((res) => setTimeout(() => res(0), wait_s * 1000))

        return {
            data: {
                args,
                "simple": "use case"
            }
        }
    }
}

async function main() {
    const myWorker = new MyWorker()
    log.info(`Starting MyWorker`, { worker_id: myWorker.worker_id })
    await myWorker.start()
}
main()