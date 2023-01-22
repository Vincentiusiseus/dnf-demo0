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
import { TokenBucket } from "./token-bucket"

// My Types
type JobParam = { job_id:string, job_grow_id:string }
type GenEntry = {
    adventurer: {
        serverId: string,
        characterId:string,
        characterName: string,
        level:number,
        jobId:string,
        jobGrowId:string,
        jobName:string,
        jobGrowName:string
    }
    dnf_api_method_name:string
    job_param: JobParam
    job_index:number
    job_length:number
    args: [string, string]
    adventurer_index:number
    adventurer_length:number
}
type Response = {
    res_data: any
    param: GenEntry
}

const PROMPT:boolean = false
const METHODS = [
    // "getCharacterTimeline",
    "getCharacterStatus",
    // "getCharacterEquipment",
    // "getCharacterAvatar",
    // "getCharacterCreature",
    // "getCharacterFlag",
    // "getCharacterTalisman",
    // "getCharacterSkillStyle",
    // "getCharacterSkillBuffEquipment",
    // "getCharacterSkillBuffAvatar",
    // "getCharacterSkillBuffCreature"
]

class Main {
    job_params:JobParam[] = []
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

    async *generator():AsyncGenerator<GenEntry> {
        const SKIP_JOB_INDEX_UPTO = 63
        const SKIP_ADVENTURER_INDEX_UPTO:any = undefined
        let job_index = 0
        for(const job_param of this.job_params) {
            job_index++
            if(SKIP_JOB_INDEX_UPTO != undefined && job_index < SKIP_JOB_INDEX_UPTO) {
                continue
            }

            const query = {
                jobId: job_param.job_id,
                jobGrowId: job_param.job_grow_id,
                level: 110,
            }
            const cursor = this.db.collection("char-infos").find(query)
            const adventurer_length = (await cursor.clone().toArray()).length
            console.log(`New job param start`, job_param,` || Adventurer total: ${adventurer_length}`)

            let adventurer_index = 0
            while(await cursor.hasNext()) {
                const adventurer = await cursor.next()

                for(const dnf_api_method_name of METHODS) {
                    /**
                     * 2023-01-20 02:38
                     * Would love to have `if` to assign args differently depending on `dnf_api_method_name` but
                     * ALL of them are server_id then character_id
                     */
                    const args:any[] = [adventurer.serverId, adventurer.characterId]
                    adventurer_index++
                    // @ts-ignore
                    yield { adventurer, dnf_api_method_name, job_param, args, adventurer_index, adventurer_length, job_index, job_length: this.job_params.length }
                }
            }

        }
    }

    async handleResponse(response:Response, worker:Worker) {
        const { param, res_data } = response

        const worker_id = worker.threadId
        
        let time_took_ms = (new Date().getTime() - this.start_dt.getTime())
        if(this.first_request_took_ms == -1) this.first_request_took_ms = time_took_ms
        time_took_ms -= this.first_request_took_ms

        this.debug_count++
        if(this.debug_count % 100 == 1) {
            const adventurer_index = param.adventurer_index
            const adventurer_length = param.adventurer_length
            const job_index = param.job_index
            const job_length = param.job_length
            console.log(
                `[${new Date().toISOString()}] Debug count: ${this.debug_count} || Job ${job_index}/${job_length} || Adventurer ${adventurer_index}/${adventurer_length}.`,
                `Took ${time_took_ms / 1000}s`
            )
        }

        /**
         * 2023-01-20 15:29
         * 무시된 에러 DNF001 "유효하지 않은 캐릭터 정보"
         */
        if(res_data == undefined) return

        // await this.db.collection("char-stats").insertOne(res_data)
    }

    async connectDb() {
        await this.client.connect()
        this.db = this.client.db("dnf-data")
    }

    async start() {
        await this.connectDb()
        
        await this.loadJobParams()
        
        const gen = this.generator()
        const worker_manager = new WorkerManager(this, 10, gen, 95, 1)
        await worker_manager.start()
    }
}

async function main() {
    await new Main().start()
}
main()