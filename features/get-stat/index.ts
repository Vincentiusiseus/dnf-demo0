// Node libs

// NPM libs

// NPM types
import { Db, FindCursor, MongoClient } from "mongodb"
import type { Worker } from "worker_threads"

// My libs
import { Prompt } from "./prompt"
import { dfQueryableJobsGenerator } from "./common"
import { client } from "../../src/db"
import { WorkerManager } from "./worker-manager"

// My Types
type Param = { job_id:string, job_grow_id:string }

const PROMPT:boolean = false
const METHODS = [
    "getCharacterTimeline",
    "getCharacterStatus",
    "getCharacterEquipment",
    "getCharacterAvatar",
    "getCharacterCreature",
    "getCharacterFlag",
    "getCharacterTalisman",
    "getCharacterSkillStyle",
    "getCharacterSkillBuffEquipment",
    "getCharacterSkillBuffAvatar",
    "getCharacterSkillBuffCreature"
]

class Main {
    job_params:Param[] = []
    client:MongoClient
    db:Db

    start_dt = new Date()
    gen_total:number
    debug_count = 0
    first_request_took_ms:number = -1

    constructor() {
        this.client = client
    }

    async loadJobParams() {
        if(PROMPT) {
            const param = await new Prompt().start()
            this.job_params.push(param)
        }
        else {
            const gen = dfQueryableJobsGenerator()
            for(const param of gen) {
                this.job_params.push({ job_id: param.jobId, job_grow_id: param.jobGrowId })
            }
        }
    }

    async *generator() {
        let job_index = 0
        for(const job_param of this.job_params) {
            const query = {
                jobId: job_param.job_id,
                jobGrowId: job_param.job_grow_id,
                level: 110
            }
            const cursor = this.db.collection("char-infos").find(query)
            const adventurer_length = (await cursor.clone().toArray()).length
            console.log(`New job param start`, job_param,` || Adventurer total: ${adventurer_length}`)

            let adventurer_index = 0
            const adventurers = []
            while(await cursor.hasNext()) {
                const adventurer = await cursor.next()
                adventurers.push(adventurer)

                for(const dnf_api_method_name of METHODS) {
                    /**
                     * 2023-01-20 02:38
                     * Would love to have `if` to assign args differently depending on `dnf_api_method_name` but
                     * ALL of them are server_id then character_id
                     */
                    const args:any[] = [adventurer.serverId, adventurer.characterId]
                    yield { adventurer, dnf_api_method_name, job_param, args }
                }
            }

            if(this.debug_count % 100 == 1) {
                console.log(`[${new Date().toISOString()}] Debug count: ${++this.debug_count} || Current adventurers: ${adventurers.length} || Adventurer ${++adventurer_index}/${adventurer_length}`)
            }
        }
    }

    async handleResponse(response:any, worker:Worker) {
        const { param, chars } = response
        const { char_name } = param
        const worker_id = worker.threadId
        
        this.debug_count++

        let time_took_ms = (new Date().getTime() - this.start_dt.getTime())
        if(this.first_request_took_ms == -1) this.first_request_took_ms = time_took_ms
        time_took_ms -= this.first_request_took_ms
        console.log(`[${new Date().toISOString()}][${worker_id}] (${this.debug_count}) res row length ${chars.length} with: ${char_name}. Took ${time_took_ms / 1000}s`)
        if(chars.length > 0) {
            await this.db.collection("char-stats").insertMany(chars)
        }
        else {
            await this.db.collection("logs").insertOne({
                datetime: new Date().toISOString(),
                msg: `Character name '${char_name}' doesn't exist.`,
                debug_count: this.debug_count
            })
        }
    }

    async start() {
        await this.client.connect()
        this.db = this.client.db("dnf-data")
        
        await this.loadJobParams()
        
        const gen = this.generator()
        const worker_manager = new WorkerManager(this, 1, gen)
        await worker_manager.start()
        await this.client.close()
    }
}

async function main() {
    await new Main().start()
}
main()