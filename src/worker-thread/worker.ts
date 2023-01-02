import { Worker, MessageChannel, isMainThread, parentPort, threadId, workerData } from "worker_threads"

parentPort.on("message", (value) => {
    const min = 500
    const max = 3000
    const random_wait_ms = Math.random() * (max - min) + min;
    const expected_time = new Date(new Date().getTime() + random_wait_ms).toISOString()
    console.log(`[${new Date().toISOString()}][worker ${threadId}] Recevied message ${value}. Send back after ${random_wait_ms} (expected time ${expected_time})`)
    setTimeout(() => {
        parentPort.postMessage(`Handled ${value}`)
    }, random_wait_ms)
})