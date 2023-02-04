// NPM libs
import inquirer from "inquirer"
// My libs
import { Option, convertToDunfaoffPayload } from "../../lib"
import { promptAdv } from "~/src/prompt-adv"
import { advGenerator } from "~/src/df-api/iterator"

// My types
import type { Payload } from "~/features/dunfaoff-scrape/load-page"

class Main {
    constructor(public option:Option) {}

    async _scrapeAdv(payload:Payload) {
        console.log("scrape adv", payload)
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