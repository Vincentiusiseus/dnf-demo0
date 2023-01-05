// Node libs
import { Worker, MessageChannel, isMainThread, parentPort, threadId, workerData } from "worker_threads"
import * as path from "path"

// NPM libs

// My libs
import { client } from "~/src/db"
import { Generator } from "./generator"

async function main() {
    await client.connect()
    const db = client.db("dnf-data")
    const start_dt = new Date()
    const generator_inst = new Generator(1000)
    const generator = generator_inst.gen()

    let requests = 1

    function startWorker() {
        const worker = new Worker(path.join(__dirname, "./worker.js"))
        worker.on("message", async (response) => {
            const res_type = response.type
            const processed_page = response.page
            const params = response.params
            let data = response.data
            const data_total = response.data_total
            const time_elapsed_ms = new Date().getTime() - start_dt.getTime()
            const time_elapsed_s = time_elapsed_ms / 1000

            if(data_total == 0) {
                generator_inst.forceNext()
            }

            console.log(
                `[${worker.threadId}][${new Date(start_dt.getTime() - start_dt.getTimezoneOffset() * 60000).toISOString()} Took ${time_elapsed_s}]`,
                `Received ${data_total} data from page ${processed_page}. Current requests per second: ${requests/time_elapsed_s}`
            )
            requests++

            if(data.length > 0) {
                data = data.map((entry:any) => Object.assign({ params }, entry))
                await db.collection("dundam-users").insertMany(data)
            }
            
            const generator_output = generator.next()
            if(generator_output.done) return
            worker.postMessage(generator_output.value)
        })
        
        // First request
        worker.postMessage(generator.next().value)
    }

    startWorker()
    startWorker()
    startWorker()
    startWorker()
    startWorker()
    startWorker()
    // startWorker()
    // startWorker()
    // startWorker()
    // startWorker()
}
main()
