// My libs
import { WorkerResponse } from "../../types"
import { BaseWorker } from "../../base-worker"

class MyWorker extends BaseWorker<any, any, any> {
    async defaultMessageHandler(args:any): Promise<WorkerResponse<any, any>> {
        return {
            data: {
                args,
                "simple": "use case"
            }
        }
    }
}

async function main() {
    await new MyWorker().start()
}
main()