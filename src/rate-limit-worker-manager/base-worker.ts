// Node libs
import { Worker, MessageChannel, isMainThread, parentPort, threadId, workerData } from "worker_threads"

// NPM libs
import { AxiosError, responseEncoding } from "axios"

// My types
import { Message, WorkerResponse, WorkerResponseSuccess, WorkerResponseError } from "./types"

export class BaseWorker<MessageArgs, ResData, ResError> {
    worker_id:number
    
    constructor() {
        this.worker_id = threadId
    }

    async defaultMessageHandler(args:MessageArgs):Promise<WorkerResponse<ResData, ResError>> {
        return {
            data: <ResData>{ args }
        }
    }

    async useEventHandlers(message:Message<MessageArgs>):Promise<WorkerResponse<ResData, ResError>> {
        const event = message.event
        const args = message.args
        const event_handler_name = `on${event[0].toUpperCase() + event.slice(1)}`

        let response:WorkerResponse<ResData, ResError>

        try {
            //@ts-ignore
            response = await this[event_handler_name](args)
        }
        catch(e) {
            throw e
        }

        return response
    }

    setupWorkerHandlers() {
        parentPort.on("message", async (message:any) => {
            let response:WorkerResponse<ResData, ResError> = null

            if(typeof message == "object" && "event" in message) {
                response = await this.useEventHandlers(message)
            }
            else {
                response = await this.defaultMessageHandler(message)
            }

            parentPort.postMessage(response)
        })
    }

    start() {
        this.setupWorkerHandlers()
    }
}