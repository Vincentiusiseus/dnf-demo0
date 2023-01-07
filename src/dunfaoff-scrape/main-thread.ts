// Node libs
import { Worker, MessageChannel, isMainThread, parentPort, threadId, workerData } from "worker_threads"
import * as path from "path"

// NPM libs
import * as _ from "lodash"
// NPM types
import type { Collection, Db, MongoClient } from "mongodb"

// My libs
import { client } from "~/src/db"
import { Generator as MyGenerator } from "./generator"

// My types
import type { Payload } from "./load-page"

const DB_NAME = "dunfaoff-chars"

class Main {
    generator_inst:MyGenerator
    generator:Generator

    client:MongoClient
    db:Db
    collection:Collection

    num_requests:number = 0
    start_dt:Date
    start_dt_str:string
    processed_char_adv_map:any = {}
    workers:any = {}
    worker_request_count:any = {}

    /**
     * 
     * @param rate_limit requests per sec
     */
    constructor(public worker_max:number, public rate_limit:number) {
        this.generator_inst = new MyGenerator(1000)
        this.generator = this.generator_inst.gen()
        this.client = client
    }

    async start() {
        this.start_dt = new Date()
        this.start_dt_str = new Date(this.start_dt.getTime() - this.start_dt.getTimezoneOffset() * 60000).toISOString()

        console.log(`Connect client`)
        await this.client.connect()
        this.db = this.client.db("dnf-data")
        this.collection = this.db.collection(DB_NAME)

        let i=0
        for(const a of Array(this.worker_max)) {
            const worker = this.startWorker()
            console.log(`Started worker ${worker.threadId}`)
            if(i+1 < this.worker_max)
                await new Promise((res) => {
                    setTimeout(() => {
                        res(0)
                    }, 500)
                })
            i++
        }
        console.log(`Ran all ${this.worker_max} workers.`)
    }

    async terminateIfPossible(worker:Worker) {
        const thread_id = worker.threadId
        await worker.terminate()
        delete this.workers[thread_id]
        if(Object.keys(this.workers).length == 0) {
            await this.client.close()
            console.log("Terminating main thread.")
            console.log(this.worker_request_count)
        }
    }

    getTimeElapsedSec() {
        const time_elapsed_ms = new Date().getTime() - this.start_dt.getTime()
        const time_elapsed_s = time_elapsed_ms / 1000
        return time_elapsed_s
    }

    async postMessageOrTerminate(worker:Worker) {
        const gen_result = this.generator.next()
        if(_.get(gen_result, "done", false) == false) {
            this.num_requests++
            const self = this
            await new Promise((res, rej) => {
                setInterval(function () {
                    const time_elapsed_s = self.getTimeElapsedSec()
                    const requests_per_sec = self.num_requests/time_elapsed_s
                    if(requests_per_sec <= self.rate_limit) {
                        clearInterval(this)
                        res(0)
                    }
                }, 500)
            })
            worker.postMessage(gen_result.value)
            _.set(this.worker_request_count, [worker.threadId], _.get(this.worker_request_count, [worker.threadId], 0) + 1)
        }
        else {
            this.terminateIfPossible(worker)
        }
        return gen_result
    }

    startWorker() {
        const worker = new Worker(path.join(__dirname, "./worker.js"))
        this.workers[worker.threadId] = worker
        console.log(`Start worker ${worker.threadId}`)

        worker.on("message", async (response) => {
            const time_elapsed_s = this.getTimeElapsedSec()

            const { param, char_data } = response
            const data_length = char_data.length

            console.log(
                `[${worker.threadId}][${this.start_dt_str} Took ${time_elapsed_s}]`,
                `Received ${data_length} data from page (${param.page}) class (${param.jobName}) awk (${param.jobGrowName}) isHoly (${param.isHoly}).`,
                `Current requests per second: ${this.num_requests/time_elapsed_s}`
            )
            
            const char_ids = char_data.map((entry:any) => entry.character_id)
            const existing_entries = await this.collection.find({ character_id: { $in: char_ids }, param }).toArray()
            const existing_entry_ids = existing_entries.map((entry:any) => entry.character_id)

            const new_entries = char_data.filter((entry:any) => existing_entry_ids.indexOf(entry.character_id) == -1)
            const insert_entries = new_entries.map((entry:any) => Object.assign({ param }, entry))
            const inserted_char_ids = insert_entries.map((entry:any) => entry.character_id)
            console.log(`[${worker.threadId}] insert ${insert_entries.length} entries`)
            if(insert_entries.length > 0) {
                try {
                    await this.collection.insertMany(insert_entries)
                }
                catch(e) {
                    console.log(char_ids)
                    console.log(existing_entry_ids)
                    throw e
                }
            }
            else {
                console.log(`[${worker.threadId}] Redundant data count (${char_ids.length}) equal the number of entries received. Not inserting any`)
                this.generator_inst.triggerNext()
            }

            this.postMessageOrTerminate(worker)
            // const gen_result = postMessage()
            // if(gen_result.done) return
        })

        this.postMessageOrTerminate(worker)
        return worker
    }
}

// async function main1() {
//     await client.connect()
//     const db = client.db("dnf-data")
//     const start_dt = new Date()
//     const start_dt_str = new Date(start_dt.getTime() - start_dt.getTimezoneOffset() * 60000).toISOString()
//     // @ts-ignore
//     const generator_inst = new Generator(1000)
//     const generator = generator_inst.gen()

//     let requests = 1
//     const processed_char_adv_map:any = {}

//     function startWorker() {
//         const worker = new Worker(path.join(__dirname, "./worker.js"))
//         worker.on("message", async (response) => {
//             const res_type = response.type
//             const processed_page = response.page
//             const received_params = response.received_params
//             const request_params = response.request_params

//             let data = response.data
//             const data_total = response.data_total
//             const time_elapsed_ms = new Date().getTime() - start_dt.getTime()
//             const time_elapsed_s = time_elapsed_ms / 1000

//             const received_zero_data = _.get(processed_char_adv_map, [request_params.char_name, request_params.awk]) != undefined

//             if(data_total == 0 && ! received_zero_data) {
//                 _.set(processed_char_adv_map, [request_params.char_name, request_params.awk], true)
//                 generator_inst.forceNext()
//             }

//             console.log(
//                 `[${worker.threadId}][${start_dt_str} Took ${time_elapsed_s}]`,
//                 `Received ${data_total} data from page ${processed_page}. Current requests per second: ${requests/time_elapsed_s}`
//             )
//             requests++

//             if(data.length > 0) {
//                 data = data.map((entry:any) => Object.assign({ received_params, request_params }, entry))
//                 await db.collection("dundam-chars").insertMany(data)
//             }
            
//             const generator_output = generator.next()
//             if(generator_output.done) return

//             const value = <any[]>generator_output.value
//             worker.postMessage(value)
//         })
        
//         // First request
//         worker.postMessage(generator.next().value)
//     }

//     startWorker()
//     startWorker()
//     startWorker()
//     startWorker()
//     startWorker()
//     startWorker()
//     startWorker()
//     startWorker()
//     startWorker()
//     startWorker()
// }
async function main() {
    await new Main(10, 20).start()
}
main()