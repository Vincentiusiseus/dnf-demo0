// Node libs
import * as fs from "fs"
// NPM libs

// My libs
import { client } from "~/src/db/index"

async function main() {
    await client.connect()
    const db = client.db("dnf-data")
    const collection = db.collection("dunfaoff-chars1")

    const length_before = await db.collection("dunfaoff-chars").countDocuments()

    const cursor = collection.find()
    /**
     * 2023-01-08 17:54
     * Unique character_id 상관 없이 전부 삽입
     */
    let document:any
    while((document = await cursor.next())) {
        db.collection("dunfaoff-chars").insertOne(document)
    }
    const length_after = await db.collection("dunfaoff-chars").countDocuments()

    console.log(`Length before ${length_before} || length after ${length_after}`)

    return
}
main()