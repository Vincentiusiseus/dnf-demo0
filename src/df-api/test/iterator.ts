// Node libs
import * as fs from "fs"
import * as path from "path"

// My libs
import { jobsDataGenerator, classGenerator, advGenerator, awkGenerator } from "../iterator"

function main() {
    const iter = [
        { name: "all", gen: jobsDataGenerator() },
        { name: "class", gen: classGenerator() },
        { name: "adv", gen: advGenerator() },
        { name: "adv-distinguish", gen: jobsDataGenerator({ adv_only: true, distinguish_buffer: true }) },
        { name: "awk", gen: awkGenerator() },
    ]

    for(const entry of iter) {
        const { gen, name } = entry
        const entries = Array.from(gen)
        console.log(`Name ${name} length: ${entries.length}`)
        fs.writeFileSync(path.join(__dirname, `../data/${name}-output.json`), JSON.stringify(entries, null, 2))
    }
}
main()