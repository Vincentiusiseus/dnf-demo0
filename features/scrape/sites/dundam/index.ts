// NPM libs
import inquirer from "inquirer"
// My libs
import { Option } from "../../lib"
import { promptAdv } from "~/src/prompt-adv"
import { convertToDundamArgs } from "./lib"
import { advGenerator } from "~/src/df-api/iterator"

class Main {
    constructor(public option:Option) {}

    async _scrapeAdv(class_name:string, neo_awk_name:string, is_buffer:boolean) {
        console.log("scrape adv", class_name, neo_awk_name, is_buffer)
    }

    async scrapeAll() {
        const gen = advGenerator({ distinguish_buffer: true })
        for(const adv of gen) {
            let class_name = adv.class_name 
            let neo_awk_name = adv.adv_name
            if(["다크나이트", "크리에이터"].includes(class_name)) {
                neo_awk_name = class_name
                class_name = "외전"
            }
            neo_awk_name = "眞 " + neo_awk_name
            const is_buffer = adv.is_buffer
            this._scrapeAdv(class_name, neo_awk_name, is_buffer)
        }
    }

    async scrapeAdv() {
        if(this.option.is_iterate_all_advs) {
            await this.scrapeAll()
        }
        else {
            while(true) {
                const prompt_result = await promptAdv()
                if(prompt_result.class.class_name == "all") {
                    await this.scrapeAll()
                    break
                }

                const args = convertToDundamArgs(prompt_result)
                await this._scrapeAdv(args.class_name, args.neo_awk_name, prompt_result.is_buffer)

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