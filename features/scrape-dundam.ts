// Node libs
import * as fs from "fs"

async function main() {
    const jobs_text = fs.readFileSync("./data/df-jobs-modified.json", "utf-8")
    const chars = JSON.parse(jobs_text)

    for(const char in chars) {
        const advs = chars[char]
        for(const adv in advs) {
            const awakenings = advs[adv]
            console.log(char, adv, awakenings)
        }
    }
}
main()