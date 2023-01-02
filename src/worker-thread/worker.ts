import { Worker, MessageChannel, isMainThread, parentPort, threadId, workerData } from "worker_threads"

parentPort.on("message", (value) => {
    const min = 500
    const max = 3000
    const random_wait_ms = Math.random() * (max - min) + min;
    console.log(`[${new Date().toISOString()}][worker ${threadId}] Recevied message ${value}. Send back after ${random_wait_ms}`)
    setTimeout(() => {
        parentPort.postMessage(`Handled ${value}`)
    }, 2000)
})