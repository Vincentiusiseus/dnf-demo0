// Node libs
import * as fs from "fs"

// NPM libs
import inquirer from "inquirer"

// My libs
import { Prompt } from "./prompt"
import { dfQueryableJobsGenerator } from "./common"

// My Types
type Param = { job_id:string, job_grow_id:string }

const PROMPT:boolean = true

class Main {

    async start() {
        const params:Param[] = []
        if(PROMPT) {
            const param = await new Prompt().start()
            params.push(param)
        }
        else {
            const gen = dfQueryableJobsGenerator()
            for(const param of gen) {
                params.push({ job_id: param.jobId, job_grow_id: param.jobGrowId })
            }
        }

        console.log(params)
    }
}

async function main() {
    await new Main().start()
}
main()