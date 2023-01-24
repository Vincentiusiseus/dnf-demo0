import type { Worker } from "worker_threads"

export type Handler<ResData, ResError> = {
    handleResponse: (response:ResData, worker:Worker) => Promise<any>
    handleError: (error:ResError, worker:Worker) => Promise<any>
    handleAllWorkersTerminated: () => any
}
export type Options = {
    worker_start_interval_ms:number
}
export type WorkerResponseSuccess<ResData> = { data:ResData }
export type WorkerResponseError<Error> = { error:Error }
export type WorkerResponse<ResData,Error> = WorkerResponseSuccess<ResData> | WorkerResponseError<Error>

export type Message<MessageArgs> = {
    event: string
    args: MessageArgs
}