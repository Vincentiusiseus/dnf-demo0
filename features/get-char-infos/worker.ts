// Node libs
import { Worker, MessageChannel, isMainThread, parentPort, threadId, workerData } from "worker_threads"
import * as fs from "fs"

// NPM types
import type { Db, MongoClient } from "mongodb"

// My libs
import { DnfApi } from "~/src/dnf-api"

// My types

const DEBUGGING:boolean = false 

class MyWorker {
    df_api:DnfApi
    client:MongoClient
    db:Db

    count:number = 0 
    total_names:number
    constructor() {
        const api_key = fs.readFileSync("./cred/api.txt", "utf-8")
        this.df_api = new DnfApi(api_key)
    }

    setupWorkerHandlers() {
        parentPort.on("message", async (param) => {
            const { char_name } = param

            let res_data = null
            try {
                res_data = await this.df_api.getCharacter("all", char_name)
            }
            catch(e) {
                if("response" in e) {
                    console.log(e.response.data)
                    console.log(e.response.status)
                    throw new Error("Request Response Error")
                }
                throw e
            }

            // console.log(res_data)
            const chars = res_data.rows

            parentPort.postMessage({ param, chars })
        })
    }

    start() {
        this.setupWorkerHandlers()
    }
}

async function main() {
    new MyWorker().start()
}
main()