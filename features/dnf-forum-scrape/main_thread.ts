// Node libs
import { Worker, MessageChannel, isMainThread, parentPort, threadId, workerData } from "worker_threads"
import * as path from "path"

// NPM libs

// My libs
import { client } from "~/src/db"

async function main() {
    await client.connect()
    const db = client.db("dnf-data")
    let page = 0
    const start_dt = new Date()

    function startWorker() {
        const worker = new Worker(path.join(__dirname, "./worker.js"))
        worker.on("message", async (response) => {
            const res_type = response.type
            const processed_page = response.page
            const data = response.data
            const data_total = response.data_total
            const time_elapsed_ms = new Date().getTime() - start_dt.getTime()
            const time_elapsed_s = time_elapsed_ms / 1000

            if(data_total == 0) {
                return
            }
            else {
                console.log(`[${worker.threadId}][Took ${time_elapsed_s}] Received ${data_total} data from page ${processed_page}. Current pages per second: ${page/time_elapsed_s}`)
                await db.collection("forum-users").insertMany(data)
                worker.postMessage(page++)
            }
        })
        worker.postMessage(page++)
    }

    startWorker()
    startWorker()
    startWorker()
    startWorker()
    startWorker()
    startWorker()
    startWorker()
    startWorker()
    startWorker()
    startWorker()
}
main()