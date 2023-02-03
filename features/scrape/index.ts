// My libs
import { Option } from "./lib"
import { prompt } from "./prompt"
import { main as scrapeDfBoard } from "./sites/df-board"
import { main as scrapeDundam } from "./sites/dundam"
import { main as scrapeDunfaoff } from "./sites/dunfaoff"

class Main {
    async start() {
        const result = await prompt()
        const target = result.target
        const is_skip_page_count = result.is_skip_page_count
        const is_iterate_all_advs = result.is_iterate_all_advs

        const is_all = target.length == 0 || target.includes("all")

        console.log({ result, is_all })

        const option:Option = { is_skip_page_count, is_iterate_all_advs }

        if(is_all || target.includes("df-board")) {
            /**
             * 2023-02-03 07:03
             * Once scraped, only new posts need to be scraped
             */
            await scrapeDfBoard(option)
        }
        
        if(is_all || target.includes("dunfaoff")) {
            await scrapeDunfaoff(option)
        }

        if(is_all || target.includes("dundam")) {
            await scrapeDundam(option)
        }
    }
}

async function main() {
    await new Main().start()
}
main()