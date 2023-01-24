// My libs
import { WorkerResponse } from "../../types"
import { BaseWorker } from "../../base-worker"
import {thread_logger as log } from "../../logger"

class MyWorker extends BaseWorker<any, any, any> {
    async defaultMessageHandler(args:any): Promise<WorkerResponse<any, any>> {
        const max = 3
        const min = 1
        const random_wait = Math.random() * (max - min) + min
        await new Promise((res) => setTimeout(() => res(0), random_wait * 1000))
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