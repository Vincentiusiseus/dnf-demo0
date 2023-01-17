// NPM types
import { Db, MongoClient } from "mongodb"

// Node libs
import * as fs from "fs"

// My libs
import { client } from "~/src/db"

class Main {
    char_infos:any[]

    client:MongoClient
    db:Db

    constructor() {
        this.client = client
        this.db = this.client.db("dnf-data")
    }

    *genAdvs() {
        for(const char_info of this.char_infos) {
            const char_name = char_info.jobName
            const adv_roots:any[] = char_info.rows
            for(const adv_root of adv_roots) {
                const adv_name = adv_root.jobGrowName
                yield { char_info, char_name, adv_root, adv_name }
            }
        }
    }

    getQueryableParams() {
        const output:any = []
        const generator = this.genAdvs()
        for(const param of generator) {
            let awk_node = param.adv_root
            while(awk_node.next != undefined) {
                awk_node = awk_node.next
            }
            output.push({
                job_id: param.char_info.jobId,
                job_grow_id: awk_node.jobGrowId,
                job_name: param.char_info.jobName,
                job_grow_name:awk_node.jobGrowName 
            })
        }
        return output
    }

    async start() {
        const file_path = "./data/df-jobs.json"
        const json_content = JSON.parse(fs.readFileSync(file_path, "utf-8"))
        this.char_infos = json_content.rows
        const queryable_params = this.getQueryableParams()
        console.log(queryable_params, queryable_params.length)

        let total = 0
        for(const param of queryable_params) {
            /**
             * 2023-01-17 16:35
             * `level: 110` Total 650,588  
             * 
             * Without `level: 110` Total 903,915
             */
            const cursor = this.db.collection("char-infos").find({ jobId: param.job_id, jobGrowId: param.job_grow_id, level: 110 })
            const result_total = (await cursor.toArray()).length
            total += result_total
            console.log(`For param (${JSON.stringify(param)}) there are ${result_total} entries`)
        }

        console.log(`Total ${total}`)

        await this.client.close()
    }
}

async function main() {
    new Main().start()
}
main()