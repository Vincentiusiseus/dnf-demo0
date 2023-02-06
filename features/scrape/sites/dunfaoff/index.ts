// Node libs
import * as qs from "querystring"

// NPM libs
import inquirer from "inquirer"

// My libs
import { Option, convertToDunfaoffPayload, ScrapeAdv, Scraper } from "../../lib"
import { promptAdv } from "~/src/prompt-adv"
import { advGenerator } from "~/src/df-api/iterator"
import { scrapePage } from "./lib"
import { getConnectedDb } from "~/src/db"

// My types
import type { Payload } from "~/features/dunfaoff-scrape/load-page"

class Main implements Scraper<Payload> {
    constructor(public option:Option) {}

    async scrape(id:number, payload:Payload, page:number):Promise<any> {
        const entries = await scrapePage(payload, page)
        console.log(entries.map(entry => entry.nick_name))
    }

    async _scrapeAdv(payload:Payload) {
        await new ScrapeAdv(payload, this).start()
    }

    async scrapeAll() {
        const gen = advGenerator({ distinguish_buffer: true })
        for(const adv of gen) {
            const payload:Payload = convertToDunfaoffPayload(adv, adv.is_buffer)
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

                const payload = convertToDunfaoffPayload(prompt_result.adv, prompt_result.is_buffer)
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