// NPM libs
import inquirer from "inquirer"
// My libs
import { Option, convertToDundamArgs, ScrapeAdv, Scraper } from "../../lib"
import { promptAdv } from "~/src/prompt-adv"
import { advGenerator } from "~/src/df-api/iterator"
import { requestBufferData, requestDealerData } from "./lib"

type Argument = {
    class_name:string,
    neo_awk_name:string,
    is_buffer:boolean
}

class Main implements Scraper<Argument> {
    constructor(public option:Option) {}

    async scrape(id: number, arg: Argument, page: number):Promise<any> {
        let entries:any[] = []
        if(arg.is_buffer) {
            entries = await requestBufferData(page, arg.class_name)
        }
        else {
            entries = await requestDealerData(page, arg.class_name, arg.neo_awk_name)
        }
    }

    async _scrapeAdv(class_name:string, neo_awk_name:string, is_buffer:boolean) {
        await new ScrapeAdv({ class_name, neo_awk_name, is_buffer }, this).start()
    }

    async scrapeAll() {
        const gen = advGenerator({ distinguish_buffer: true })
        for(const adv of gen) {
            const { class_name, neo_awk_name } = convertToDundamArgs(adv)
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
                if(prompt_result.is_all) {
                    await this.scrapeAll()
                    break
                }

                const args = convertToDundamArgs(prompt_result.adv)
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