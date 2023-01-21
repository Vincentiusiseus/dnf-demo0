// Node libs
import { Worker, MessageChannel, isMainThread, parentPort, threadId, workerData } from "worker_threads"
import * as fs from "fs"

// NPM libs
import { AxiosError } from "axios"

// NPM types
import type { Db, MongoClient } from "mongodb"

// My libs
import { DnfApi } from "~/src/dnf-api"
import { thread_logger as log } from "../logger"

// My types

const DEBUGGING:boolean = false 

class MyWorker {
    df_api:DnfApi
    client:MongoClient

    count:number = 0 
    total_names:number
    constructor() {}

    setupWorkerHandlers() {
        parentPort.on("message", async (param) => {
            log.info(`got message`, { param, worker_id:threadId })
            parentPort.postMessage("hi")
        })
    }

    start() {
        log.info({ worker_id:threadId, message: `started.` })
        this.setupWorkerHandlers()
    }
}

async function main() {
    new MyWorker().start()
}
main()