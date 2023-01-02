// Node libs
import { Worker, MessageChannel, isMainThread, parentPort, threadId, workerData } from "worker_threads"

// Npm types
import type { JSDOM } from "jsdom"

// My libs
import { loadPageJsdom } from "./load-page"
import { scrapePostData } from "./lib"

parentPort.on("message", async (page) => {
    const jsdom:JSDOM = await loadPageJsdom(page)
    const scraped_data = scrapePostData(jsdom)
    // console.log(scraped_data)
    parentPort.postMessage({ type: "Done", page, data: scraped_data, data_total: scraped_data.length })
})