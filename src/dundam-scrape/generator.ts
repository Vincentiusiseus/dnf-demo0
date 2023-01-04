// Node libs
import * as fs from "fs"

function paramGenerator() {
    const jobs_text = fs.readFileSync("./data/df-jobs-modified.json", "utf-8")
    const jobs_data = JSON.parse(jobs_text)

    const char_names = Object.keys(jobs_data)
    for(const char_name of char_names) {
        const adv_names = Object.keys(jobs_data[char_name])
        for(const adv_name of adv_names) {
            console.log(char_name, adv_name, jobs_data[char_name][adv_name])
        }
    }
}

paramGenerator()