// Node libs
import * as fs from "fs"
// NPM libs

// My libs
import { client } from "./index"

async function main() {
    await client.connect()
    const db = client.db("dnf-data")
    const collection = db.collection("dundam-chars")

    const jobs_data = JSON.parse(fs.readFileSync("./data/df-jobs-modified.json", "utf-8"))

    for(let char_name in jobs_data) {
        const char_data = jobs_data[char_name]
        for(let adv_name in char_data) {
            const awks = char_data[adv_name]
            const awk = awks.slice(-1)[0]
            char_name = adv_name == "자각1" ? "외전" : char_name 
            console.log(char_name, adv_name, awk)

            const result = collection.aggregate([
                { "$match": { "request_params.awk": awk, "request_params.char_name": char_name } }
            ])
            console.log((await result.toArray()).length)
        }
    }

    console.log(await collection.countDocuments())

    await client.close()
}
main()