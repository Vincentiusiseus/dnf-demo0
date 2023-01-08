// Node libs
import { Worker, MessageChannel, isMainThread, parentPort, threadId, workerData } from "worker_threads"

// Npm types
import type { JSDOM } from "jsdom"

// My libs
import { requestBufferData, requestDealerData } from "./load-page"

parentPort.on("message", async (data) => {
    console.log(`worker on message:`, data)
    
    const { _type, page } = data
    let res_data:any
    let request_params:any

    if(_type == "dealer") {
        let { char_name, adv_name, awks } = data
        if(adv_name == "자각1") {
            char_name = "외전"
        }
        const awk = awks.slice(-1)[0]
        res_data = await requestDealerData(page, char_name, awk)
        request_params = { char_name, adv_name, awks }
    }
    else if(_type == "buffer") {
        const { job } = data
        res_data = await requestBufferData(page, job)
        request_params = { job }
    }
    else{}

    console.log(res_data)

    parentPort.postMessage({ type: "Done", page, data: res_data.ranking, data_total: res_data.ranking.length, received_params:data, request_params })
})