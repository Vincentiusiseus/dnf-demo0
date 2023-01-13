// NPM types
import { Db, MongoClient } from "mongodb"

// My libs
import { client } from "~/src/db"

class Main {
    client:MongoClient
    db:Db

    constructor() {
        this.client = client
        this.db = this.client.db("dnf-data")
    }

    async distinctCharNames() {
        const cursor = this.db.collection("char-names").find()
        const distinct_map:any = {}
        let count = 0
        const start_dt = new Date()
        while(await cursor.hasNext()) {
            const entry = await cursor.next()
            const char_name = entry["char_name"]
            distinct_map[char_name] = char_name in distinct_map ? distinct_map[char_name] : 1
            if(++count % 1000 == 1) {
                const time_took_s = (new Date().getTime() - start_dt.getTime())/1000
                console.log(`[Took ${time_took_s}s] Checking ${count}-th entry.`)
            }
        }
        /**
         * 2023-01-13 12:51
         * 840,721개 기록 사용시 840,721의 distinct 기록. 1000개마다 부가 로깅 없이 3.8초, 있으면 4.3초
         * 어쨌든 char-names db에는 중복된 char-name이 없다는 것을 확인!
         */
        const time_took_s = (new Date().getTime() - start_dt.getTime()) / 1000
        console.log(`[Took ${time_took_s}s] Distinct char names: ${Object.keys(distinct_map).length}`)
    }

    async start() {
        await this.distinctCharNames()
        await this.client.close()
    }
}

async function main() {
    new Main().start()
}
main()