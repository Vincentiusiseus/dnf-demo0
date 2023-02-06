// Node libs
import * as qs from "querystring"

// NPM libs
import inquirer from "inquirer"
const TokenBucket = require("tokenbucket")

// My libs
import { Option, convertToDunfaoffPayload } from "../../lib"
import { promptAdv } from "~/src/prompt-adv"
import { advGenerator } from "~/src/df-api/iterator"
import { scrapePage } from "./lib"

// My types
import type { Payload } from "~/features/dunfaoff-scrape/load-page"


class ScrapeAdv {
    scrape_tasks:{[id:number]:Promise<any>} = {}
    is_done:boolean = false
    is_last_page:boolean = false
    
    finish_task_res:any = null

    constructor(public payload:Payload) { }

    * generateArgs() {
        let page = 1
        while(true) {
            yield [this.payload, page]

            page++
        }
    }

    async _runTask(id:number, args:any):Promise<any> {
        //@ts-ignore
        const scrape_result = await scrapePage(...args)
        console.log(scrape_result.length)
    }

    async runTask(id:number, args:any):Promise<any> {
        await this._runTask(id, args)
        delete this.scrape_tasks[id]
        if(this.is_last_page && Object.keys(this.scrape_tasks).length == 0) {
            this.is_done = true
            this.finish_task_res()
        }
    }

    async start() {
        const promise = new Promise((res) => {
            this.finish_task_res = res
        })

        let id = 0
        const generator = this.generateArgs()
        while(true) {
            const gen_result = generator.next()
            if(gen_result.done) break
            const args = gen_result.value

            console.log(args)

            if(id >= 5) break

            this.scrape_tasks[id] = this.runTask(id, args)
            id++
        }

        await promise
    }
}

class Main {
    constructor(public option:Option) {}

    async _scrapeAdv(payload:Payload) {
        await new ScrapeAdv(payload).start()
    }

    async scrapeAll() {
        const gen = advGenerator({ distinguish_buffer: true })
        for(const adv of gen) {
            const payload:Payload = convertToDunfaoffPayload(adv)
            await this._scrapeAdv(payload)
        }
    }

    async scrapeAdv() {
        if(this.option.is_iterate_all_advs) {
            await this.scrapeAll()
        }
        else {
            while(true) {
                const prompt_result = await promptAdv()
                if(prompt_result.is_all) {
                    await this.scrapeAll()
                    break
                }

                const payload = convertToDunfaoffPayload(prompt_result.adv)
                await this._scrapeAdv(payload)

                const continue_result = await inquirer.prompt([
                    {
                        name: "continue",
                        message: "계속 하겠습니까? (기본: 아니요)",
                        type: "confirm",
                        default: false
                    }
                ])

                if(continue_result.continue == false) break
            }
        }
    }

    async start() {
        this.scrapeAdv()
    }
}

export async function main(option:Option) {
    new Main(option).start()
}