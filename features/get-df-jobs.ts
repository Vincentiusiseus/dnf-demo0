// Node libs
import * as fs from "fs"

// My libs
import { DnfApi } from "~/src/dnf-api"

class Main {
    api_res_data:any
    df_jobs_modified:any

    constructor() {
        this.api_res_data = null
        this.df_jobs_modified = null
    }

    async getSimpleDfJobs() {
        const api_key = fs.readFileSync("./cred/api.txt", "utf-8").trim()
        const inst = new DnfApi(api_key)
        this.api_res_data = await inst.getDfJobs()
        fs.writeFileSync("./data/df-jobs.json", JSON.stringify(this.api_res_data, null, 2))
    }

    modifyDfJobs() {
        this.df_jobs_modified = {}

        const base_jobs = this.api_res_data.rows
        for(const base_job of base_jobs) {
            const base_job_name = base_job["jobName"]
            this.df_jobs_modified[base_job_name] = {}

            const job_grows = base_job["rows"]
            for(const job_grow of job_grows) {
                const adv_name = job_grow.jobGrowName
                this.df_jobs_modified[base_job_name][adv_name] = []

                let next_adv = job_grow.next
                while(next_adv != null) {
                    this.df_jobs_modified[base_job_name][adv_name].push(next_adv.jobGrowName)
                    next_adv = next_adv.next
                }
            }
        }
        fs.writeFileSync("./data/df-jobs-modified.json", JSON.stringify(this.df_jobs_modified, null, 2))
    }

    async start() {
        await this.getSimpleDfJobs()
        this.modifyDfJobs()
    }
}

async function main() {
    await new Main().start()
}
main()