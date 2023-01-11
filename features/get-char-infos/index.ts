// Node libs
import * as fs from "fs"

// NPM types
import type { Db, FindCursor, MongoClient } from "mongodb"

// My libs
import { client } from "~/src/db"
import { TokenBucket } from "./token-bucket"
import { WorkerHandler } from "./worker-handler"

let total_requests = 0
let start_dt:Date = null

class MyWorkerHandler extends WorkerHandler {
    mainHandler:any
    waiterFunction:any
    token_bucket:TokenBucket

    setController(inst:Main) {
        this.mainHandler = inst.handleResponse.bind(inst)
        this.token_bucket = inst.token_bucket
        this.waiterFunction = async () => {
            let wait_count = 0
            while(true) {
                const token_left:number = this.token_bucket.bucket

                if(token_left == 0) {
                    const wait_ms = this.token_bucket.max_time_s * 1000
                    console.log(`[${new Date().toISOString()}][${this.id}] waiter function (${wait_ms}ms) - token_left '${token_left} || wait count '${++wait_count}'`)
                    const actual_start_dt = new Date()
                    await new Promise((res) => {
                        // setTimeout(() => {
                        //     const actual_end_dt = new Date()
                        //     console.log(`[${new Date().toISOString()}][${this.id}] Actual wait: ${actual_end_dt.getTime() - actual_start_dt.getTime()}ms`)
                        //     res(0)
                        // }, wait_ms)
                        setTimeout(() => res(0), wait_ms)
                    })
                    this.token_bucket.updateBucket()
                }
                else {
                    break
                }
            }
        }
    }

    async postMessage(): Promise<boolean> {
        await this.waiterFunction()
        if(start_dt == null) start_dt = new Date()
        this.token_bucket.bucket--
        total_requests++
        console.log(`[${new Date().toISOString()}][${this.id}] RATE = ${total_requests / ((new Date().getTime() - start_dt.getTime())/1000)}`)
        return await super.postMessage()
    }

    async handleResponse(response: any): Promise<void> {
        await this.mainHandler(this.id, response)
    }
}

type MainOptions = {
    max_workers: number
}

class Main {
    client:MongoClient
    db:Db
    cursor:FindCursor
    gen:AsyncGenerator

    token_bucket:TokenBucket
    workers:any = {}

    first_request_took_ms:number = -1
    count:number = 0 
    start_dt:Date
    total_names:number

    constructor(public options:MainOptions = { max_workers: 1 }) {
        const api_key = fs.readFileSync("./cred/api.txt", "utf-8")
        this.client = client
        this.token_bucket = new TokenBucket(100, 1)
    }

    async handleResponse(worker_id:number, response:any) {
        const { param, chars } = response
        const { char_name } = param
        
        this.count++

        let time_took_ms = (new Date().getTime() - this.start_dt.getTime())
        if(this.first_request_took_ms == -1) this.first_request_took_ms = time_took_ms
        time_took_ms -= this.first_request_took_ms
        console.log(`[${new Date().toISOString()}][${worker_id}] (${this.count}) res row length ${chars.length} with: ${char_name}. Took ${time_took_ms / 1000}s`)
        if(chars.length > 0) {
            console.log(`[${new Date().toISOString()}][${worker_id}] (${this.count}) res row length ${chars.length} with: ${char_name}. Took ${time_took_ms / 1000}s`)
            await this.db.collection("char-infos").insertMany(chars)
        }
        else {
            // console.log(`[${new Date().toISOString()}][${worker_id}] --- No character info retrieved with ${char_name}`)
            // await this.db.collection("logs").insertOne({
            //     datetime: new Date().toISOString(),
            //     msg: `Character name '${char_name}' doesn't exist.`,
            //     count: this.count
            // })
        }
        if(this.count % 100 == 1) {
            console.log(`[${new Date().toISOString()}][${worker_id}] Inserted (${this.count}/${this.total_names}): ${char_name}. Took ${time_took_ms / 1000}s`)
        }
    }

    async *getGenerator() {
        this.cursor = this.db.collection("char-names").find()
        while(await this.cursor.hasNext())
            yield await this.cursor.next()
    }

    async startWorker() {
        const worker = new MyWorkerHandler(this.gen)
        worker.setController(this)
        const worker_id = worker.id
        this.workers[worker_id] = worker
        worker.start()
    }

    async start() {
        await this.client.connect()
        this.db = this.client.db("dnf-data")
        this.total_names = await this.db.collection("char-names").countDocuments()
        this.gen = this.getGenerator()
        this.start_dt = new Date()

        // Start workers as many as `max_workers`
        let worker_count = 0
        const max_workers = this.options.max_workers
        console.log(`[${new Date().toISOString()}] Starting ${max_workers} workers.`)
        while(++worker_count <= max_workers) {
            this.startWorker()
            if(worker_count < max_workers) {
                await new Promise((res) => setTimeout(() => res(0), 500))
            }
        }
        console.log(`Ran all workers============`)
    }
}

async function main() {
    await new Main({ max_workers: 10 }).start()
}
main()