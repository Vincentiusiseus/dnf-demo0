// Node libs
import { Worker } from "worker_threads"
import * as path from "path"

// NPM libs
import yargs from "yargs"

// My libs
import { RatelimitWorkerManager } from "../../ratelimit-worker-manager"

// My types
import type { Handler, Options, WorkerResponse, WorkerResponseError, WorkerResponseSuccess } from "../../types"

class MyHandler implements Handler<any,any> {
    handleAllWorkersTerminated():any {
        console.log("All done")
    }

    async handleResponse(response: any, worker: Worker):Promise<any> {
        console.log(`Got response`, response)
    }

    async handleError(error: any, worker: Worker):Promise<any> {
        return
    }
}

async function * generator(count_upto:number) {
    let count = 0
    while(++count <= count_upto) {
        yield count
    }
}

function parseArgs() {
    const parsed = yargs(process.argv.slice(2))
        .option("workers", {
            alias: "w",
            type: "number",
            demandOption: true,
            description: "Number of workers"
        })
        .option("tokens", {
            alias: "t",
            type: "number",
            demandOption: true,
            description: "Number of tokens over interval"
        })
        .option("interval", {
            alias: "i",
            type: "number",
            demandOption: true,
            description: "Interval to track token rate (in seconds)"
        })
        .option("worker_interval", {
            alias: "wi",
            type: "number",
            default: 0,
            description: "Interval between starting a new worker (in ms). Default: 0"
        })
        .option("count", {
            alias: "c",
            type: "number",
            default: 100,
            description: "Arg count max. Default: 100"
        })
        .option("worker-wait", {
            alias: "ww",
            type: "array",
            default: [0,0],
            description: "Worker wait min and max in seconds. Default: `--ww 0 0`"
        })
        .parse()
    
    return parsed
}

async function main() {
    const parsed_args = parseArgs()
    const { workers, tokens, interval, worker_interval, count } = <any>parsed_args
    const my_handler = new MyHandler()
    const worker_path = path.join(__dirname, "./my_worker.ts")
    const args = [my_handler, worker_path, workers, generator(count), tokens, interval]
    if(worker_interval != undefined) {
        args.push({ worker_start_interval_ms: worker_interval })
    }
    console.log(args)
    //@ts-ignore
    const manager = new RatelimitWorkerManager(...args)
    await manager.start()
}
main()