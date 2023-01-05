// Node libs
import { Worker, MessageChannel, isMainThread, parentPort, threadId, workerData } from "worker_threads"

// Npm types
import type { JSDOM } from "jsdom"

// My libs
import { requestDealerData } from "./load-page"

parentPort.on("message", async (data) => {
    console.log(data)
    let [char_name, adv_name, awks, page] = data
    if(adv_name == "자각1") {
        char_name = "외전"
    }
    const res_data = await requestDealerData(page, char_name, awks.slice(-1)[0])
    // console.log(res_data)
    parentPort.postMessage({ type: "Done", page, data: res_data.ranking, data_total: res_data.ranking.length, params:data })
})