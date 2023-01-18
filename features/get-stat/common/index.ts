// Node libs
import * as fs from "fs"

export function* dfQueryableJobsGenerator() {
    const file_path = "./data/df-jobs.json"
    const json_content = JSON.parse(fs.readFileSync(file_path, "utf-8"))
    const char_infos = json_content.rows

    for(const char_info of char_infos) {
        const char_name = char_info.jobName
        const adv_roots:any[] = char_info.rows
        for(const adv_root of adv_roots) {
            const adv_name = adv_root.jobGrowName
            const jobId = char_info.jobId
            const jobName = char_info.jobName

            let awk_node = adv_root
            while(awk_node.next != undefined) {
                awk_node = awk_node.next
            }

            const jobGrowId = awk_node.jobGrowId
            const jobGrowName = awk_node.jobGrowName

            // yield { char_info, char_name, adv_root, adv_name, jobId, jobName, jobGrowId, jobGrowName }
            yield { jobId, jobName, jobGrowId, jobGrowName }
        }
    }
}