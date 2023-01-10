// Node libs
import * as fs from "fs"

// NPM types
import type { Db, MongoClient } from "mongodb"

// My libs
import { client } from "~/src/db"
import { DnfApi } from "~/src/dnf-api"

function localISO() {
    
}

class Main {
    df_api:DnfApi
    client:MongoClient
    db:Db

    count:number = 0 
    total_names:number
    constructor() {
        const api_key = fs.readFileSync("./cred/api.txt", "utf-8")
        this.df_api = new DnfApi(api_key)
        this.client = client
    }

    async queryCharNameAndStore(char_name:string) {
        let res_data = null
        try {
            res_data = await this.df_api.getCharacter("all", char_name)
        }
        catch(e) {
            console.log(e.response)
            console.log(e.response.status)
            throw e
        }

        const chars = res_data.rows
        if(chars.length > 0) {
            await this.db.collection("char-infos").insertMany(chars)
        }
        else {
            await this.db.collection("logs").insertOne({
                datetime: new Date(),
                msg: `Character name '${char_name}' doesn't exist.`,
                count: this.count
            })
        }
    }

    async start() {
        await this.client.connect()
        this.db = this.client.db("dnf-data")
        const cursor = this.db.collection("char-names").find()
        this.total_names = await this.db.collection("char-names").countDocuments()
    
        let document:any = null
        while((document = await cursor.next())) {
            this.count++

            const { char_name } = document
            await this.queryCharNameAndStore(char_name)

            if(this.count % 1000 == 1) {
                console.log(`[${new Date()}] Inserted (${this.count}/${this.total_names}): ${char_name}`)
            }
        }
    }
}

async function main() {
    await new Main().start()
}
main()