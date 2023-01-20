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
    db:Db

    count:number = 0 
    total_names:number
    constructor() {
        const api_key = fs.readFileSync("./cred/api.txt", "utf-8")
        this.df_api = new DnfApi(api_key)
    }

    setupWorkerHandlers() {
        parentPort.on("message", async (param) => {
            const { adventurer, dnf_api_method_name, job_param, args } = param

            let res_data:any = null
            try {
                //@ts-ignore
                res_data = await this.df_api[dnf_api_method_name](...args)

                // DEBUG
                // res_data = { rows: [] }
            }
            catch(e) {
                if("response" in e) {
                    console.log(`[${new Date().toISOString()}]`,e.response.data, args)
                    console.log(e.response.status)
                    throw new Error("Request Response Error")
                }
                else if(e instanceof AxiosError && e.code == "ETIMEDOUT") {
                    /**
                     * 2023-01-11 21:58
                     * Simply try again
                     */
                    //@ts-ignore
                    res_data = await this.df_api[dnf_api_method_name](...args)
                }
                else {
                    throw e
                }
            }

            parentPort.postMessage({ param, res_data })
        })
    }

    start() {
        console.log(`Start: ${threadId}`)
        this.setupWorkerHandlers()
    }
}

async function main() {
    new MyWorker().start()
}
main()