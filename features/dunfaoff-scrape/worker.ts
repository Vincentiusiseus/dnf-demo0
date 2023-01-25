// Node libs
import { Worker, MessageChannel, isMainThread, parentPort, threadId, workerData } from "worker_threads"

// My libs
import { makeRequest } from "./load-page"
import { scrapeCharData } from "./scrape"

// My types
import type { Payload } from "./load-page"

const DEBUGGING:boolean = false 

parentPort.on("message", async (param) => {
    const param_copy = Object.assign({}, param)
    const page = param_copy.page
    delete param_copy.page
    const payload = param_copy

    let char_data:any[] = []

    // @ts-ignore
    if(DEBUGGING == false) {
        const response = await makeRequest(payload, page)
        const html_content = response.data
        char_data = await scrapeCharData(html_content)
    }
    else {
        const char_data:any[] = []
    }

    parentPort.postMessage({ param, char_data })
})