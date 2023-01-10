// Node libs
import * as fs from "fs"

// NPM types
import type { Db, FindCursor, MongoClient } from "mongodb"

// My libs
import { client } from "~/src/db"
import { DnfApi } from "~/src/dnf-api"
import { TokenBucket } from "./token-bucket"
import { WorkerHandler } from "./worker-handler"

class MyWorkerHandler extends WorkerHandler {
    mainHandler:any
    waiterFunction:any

    setController(inst:Main) {
        this.mainHandler = inst.handleResponse.bind(inst)
        this.waiterFunction = async () => {
            const token_bucket = inst.token_bucket
            const token_left = token_bucket.updateBucket()
            // console.log("waiter function", this.id, token_left)
            if(token_left <= 0) {
                await new Promise((res) => setTimeout(() => res(0), token_bucket.max_time_s * 1000))
            }
        }
    }

    async postMessage(): Promise<boolean> {
        await this.waiterFunction()
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
        if(chars.length > 0) {
            await this.db.collection("char-infos").insertMany(chars)
        }
        else {
            await this.db.collection("logs").insertOne({
                datetime: new Date().toISOString(),
                msg: `Character name '${char_name}' doesn't exist.`,
                count: this.count
            })
        }
        if(++this.count % 100 == 1) {
            console.log(`[${new Date()}] Inserted (${this.count}/${this.total_names}): ${char_name}`)
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
        console.log(`[${new Date()}] Starting ${max_workers} workers.`)
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