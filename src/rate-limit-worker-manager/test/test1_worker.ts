// Node libs
import { Worker, MessageChannel, isMainThread, parentPort, threadId, workerData } from "worker_threads"
import * as fs from "fs"

// NPM libs
import { AxiosError } from "axios"

// NPM types
import type { Db, MongoClient } from "mongodb"

// My libs
import { DnfApi } from "~/src/dnf-api"

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
            console.log(`Worker ${threadId} got message`, param)
            parentPort.postMessage("hi")
        })
    }

    start() {
        console.log(`Worker ${threadId} started.`)
        this.setupWorkerHandlers()
    }
}

async function main() {
    new MyWorker().start()
}
main()