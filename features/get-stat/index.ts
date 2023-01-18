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

    debug_count = 0

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
        for(const job_param of this.job_params) {
            const query = {
                jobId: job_param.job_id,
                jobGrowId: job_param.job_grow_id,
                level: 110
            }
            const cursor = this.db.collection("char-infos").find(query)

            const adventurers = []
            while(await cursor.hasNext()) {
                const adventurer = await cursor.next()
                adventurers.push(adventurer)

                for(const dnf_api_method_name of METHODS) {
                    yield { adventurer, dnf_api_method_name, job_param }
                }
            }
            console.log(++this.debug_count, job_param, adventurers.length)
        }
    }

    async start() {
        await this.client.connect()
        this.db = this.client.db("dnf-data")
        
        await this.loadJobParams()
        
        const gen = this.generator()
        let count = 0
        for await (const param of gen) {
            console.log(param)
            count++
            if(count >= 100) break
        }

        await this.client.close()
    }
}

async function main() {
    await new Main().start()
}
main()