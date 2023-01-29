// Node libs
import * as fs from "fs"
import * as path from "path"

// NPM libs
import * as _ from "lodash"

// My libs
import { getAllParams } from "./lib"

async function main() {
    const dundam:any[] = JSON.parse(fs.readFileSync(path.join(__dirname, "./data/dundam.json"), "utf-8"))
    const dunfaoff:any[] = JSON.parse(fs.readFileSync(path.join(__dirname, "./data/dunfaoff.json"), "utf-8"))
    const params = getAllParams()

    for(const param of params) {
        const dundam_index = dundam.findIndex((entry) => _.isEqual(entry.param, param))
        const dunfaoff_index = dundam.findIndex((entry) => _.isEqual(entry.param, param))
        const dundam_entry = dundam.splice(dundam_index, 1)[0]
        const dunfaoff_entry = dunfaoff.splice(dunfaoff_index, 1)[0]
        const dundam_pages = dundam_entry.last_page
        const dunfaoff_pages = dunfaoff_entry.last_page
        console.log(`${param} || dundam ${dundam_pages} , dunfaoff ${dunfaoff_pages} || Diff ${dunfaoff_pages - dundam_pages}`)
    }
}
main()