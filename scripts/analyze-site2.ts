// Node libs
import * as fs from "fs"
// NPM libs

// My libs
import { client } from "~/src/db/index"
import { paramGen } from "~/src/dunfaoff-scrape/generator"

async function main() {
    await client.connect()
    const db = client.db("dnf-data")
    const collection = db.collection("dunfaoff-chars")
    const gen = paramGen()
    
    const redownload_list = []
    for(const param of gen) {
        const keys = Object.keys(param)
        let query_param:any = {}
        for(const k of keys) {
            // @ts-ignore
            query_param[`param.${k}`] = param[k]
        }
        const cursor = await collection.find(query_param)
        const result_list = await cursor.toArray()
        const char_ids = result_list.map((entry:any) => entry.character_id)
        const unique_char_ids = Array.from(new Set(char_ids))
        const unique_char_length = unique_char_ids.length
        console.log(param, result_list.length, unique_char_length)
        if(unique_char_ids.length < 1000) {
            redownload_list.push([param,unique_char_length])
        }
    }
    await client.close()
    console.log(`Redownload list:`)
    console.log(redownload_list)
    return
}
main()