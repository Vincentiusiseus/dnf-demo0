// Node libs
import * as fs from "fs"

export function loadDfJobs() {
    const file_path = "./data/df-jobs-modified.json"
    const content = JSON.parse(fs.readFileSync(file_path, "utf-8"))
    console.log(content)

    const char_names = Object.keys(content)
    let adv_names:string[] = []
    let awk_names:string[] = []

    for(const char_name of char_names) {
        const char_info = content[char_name]
        const _adv_names = Object.keys(char_info)
        adv_names = adv_names.concat(_adv_names)
        for(const adv_name of _adv_names) {
            const _awk_names = char_info[adv_name]
            awk_names = awk_names.concat(_awk_names)
        }
    }

    const output = {
        char_names,
        adv_names,
        awk_names
    }

    console.log(char_names, char_names.length)
    console.log(adv_names, adv_names.length)
    console.log(awk_names, awk_names.length)
    console.log(Array.from(new Set(awk_names)).length)
}

loadDfJobs()