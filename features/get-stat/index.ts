// Node libs

// NPM libs

// NPM types
import { Db, FindCursor, MongoClient } from "mongodb"

// My libs
import { Prompt } from "./prompt"
import { dfQueryableJobsGenerator } from "./common"
import { client } from "../../src/db"

// My Types
type Param = { job_id:string, job_grow_id:string }

const PROMPT:boolean = false

class Main {
    params:Param[] = []
    client:MongoClient
    db:Db

    debug_count = 0

    constructor() {
        this.client = client
    }

    async loadParams() {
        if(PROMPT) {
            const param = await new Prompt().start()
            this.params.push(param)
        }
        else {
            const gen = dfQueryableJobsGenerator()
            for(const param of gen) {
                this.params.push({ job_id: param.jobId, job_grow_id: param.jobGrowId })
            }
        }
    }

    async iterateAdventurers(cursor:FindCursor, param:Param) {
        const adventurers = []
        while(await cursor.hasNext()) {
            const adventurer = await cursor.next()
            adventurers.push(adventurer)
        }
        console.log(++this.debug_count, param, adventurers.length)
    }

    async start() {
        await this.client.connect()
        this.db = this.client.db("dnf-data")
        
        await this.loadParams()
        
        for(const param of this.params) {
            const query = {
                jobId: param.job_id,
                jobGrowId: param.job_grow_id,
                level: 110
            }
            const cursor = this.db.collection("char-infos").find(query)
            await this.iterateAdventurers(cursor, param)
        }

        await this.client.close()
    }
}

async function main() {
    await new Main().start()
}
main()