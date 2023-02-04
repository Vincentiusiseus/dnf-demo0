// NPM libs
import * as fs from "fs"
import * as path from "path"

export function getAdvJson(adv_name:string) {
    const raw_content = fs.readFileSync(path.join(__dirname, "./data/jobs-res.json"), "utf-8")
    const res_data = JSON.parse(raw_content)
    const class_data = res_data.rows

    let adv_entry:any = null

    class_loop:
    for(const class_entry of class_data) {
        const advs = class_entry.rows

        for(const adv of advs) {
            if(adv.jobGrowName == adv_name) {
                adv_entry = adv
                break class_loop
            }
        }
    }

    return adv_entry
}