// Node libs
import * as fs from "fs"

// NPM libs
import inquirer from "inquirer"

type CharEntry = { char_name:string, job_id: string }
type AwkEntry = { awk_name:string, job_grow_id: string }
type Target = { job_id:string, job_grow_id:string }

export class Prompt {
    char_entries:CharEntry[] = []
    awk_map:{ [job_id:string]: AwkEntry[] } = {}
    target:Target = { job_id: "", job_grow_id: "" }
    saved_job_prompt:CharEntry

    loadCharInfo() {
        const file_path = "./data/df-jobs.json"
        const json_content = JSON.parse(fs.readFileSync(file_path, "utf-8"))
        const char_infos = json_content.rows

        for(const char_info of char_infos) {
            const job_id = char_info.jobId
            this.char_entries.push({ char_name: char_info.jobName, job_id })
            
            this.awk_map[job_id] = []
            const adv_infos = char_info.rows
            for(const adv_info of adv_infos) {
                let awk_node = adv_info.next
                while(awk_node.next != undefined) {
                    awk_node = awk_node.next
                }
                this.awk_map[job_id].push({ awk_name: awk_node.jobGrowName, job_grow_id: awk_node.jobGrowId })
            }
        }
    }

    async saveJobId() {
        const char_prompt = await inquirer.prompt([
            {
                name: "character",
                type: "rawlist",
                choices: this.char_entries.map(entry => ({
                    name: entry.char_name,
                    value: entry
                })),
            },
        ])
        this.saved_job_prompt = char_prompt["character"]
        this.target.job_id = this.saved_job_prompt.job_id
    }

    async saveJobGrowId() {
        if(["크리에이터", "다크나이트"].includes(this.saved_job_prompt.char_name)) {
            this.target.job_grow_id = this.awk_map[this.target.job_id][0].job_grow_id
            return
        }

        const awk_prompt = await inquirer.prompt([{
                name: "advancement",
                type: "rawlist",
                choices: () => {
                    const job_id = this.saved_job_prompt.job_id
                    
                    return this.awk_map[job_id].map(entry => ({
                        name: entry.awk_name,
                        value: entry
                    }))
                }
            }
        ])
        this.target.job_grow_id = awk_prompt.advancement.job_grow_id
    }

    async start() {
        this.loadCharInfo()
        await this.saveJobId()
        await this.saveJobGrowId()
        return this.target
    }
}