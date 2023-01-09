// NPM types
import type { Db, MongoClient } from "mongodb"

// My libs
import { client } from "~/src/db"

const COLLECTION__NICK_FIELD = {
    "dundam-buffer-chars": "nick",
    "dundam-chars": "nick",
    "dunfaoff-chars": "nick_name",
    "forum-users": "user_name"
}

class Main {
    client:MongoClient
    db:Db
    
    constructor() {
        this.client = client
    }

    async start() {
        const start_dt = new Date()
        
        await client.connect()
        this.db = client.db("dnf-data")

        const COL_NAME = "char-names"
        console.log(await this.db.collection(COL_NAME).createIndex({ char_name: 1 }))

        let count = 0
        for(const collection_name of Object.keys(COLLECTION__NICK_FIELD)) {
            console.log(`Collection name: ${collection_name}`)
            // @ts-ignore
            const key_name = COLLECTION__NICK_FIELD[collection_name]

            const cursor = this.db.collection(collection_name).find()
            const all_entries = await cursor.toArray()
            const char_names = all_entries.map(entry => entry[key_name])
            const unique_char_entries = Array.from(new Set(char_names)).map(char_name => ({ char_name, collection_name }))
            console.log(`Unique char names in '${collection_name}': ${unique_char_entries.length}/${all_entries.length}`)
            for(const char_entry of unique_char_entries) {
                const { char_name, collection_name } = char_entry
                const upsert_result = await this.db.collection(COL_NAME).updateOne({ char_name } , { $push: { collection_name } }, { upsert: true })
                if(++count % 1000 == 0) {
                    console.log(`[${collection_name}][Took ${new Date().getTime() - start_dt.getTime()}ms] Upserting ${count}-th entry`, upsert_result)
                }
            }
        }

        console.log(`Done. Took ${new Date().getTime() - start_dt.getTime()}ms`)

        await client.close()
    }
}

async function main() {
    await new Main().start()
}
main()