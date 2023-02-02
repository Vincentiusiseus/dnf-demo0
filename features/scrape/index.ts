import { prompt } from "./prompt"

class Main {
    async start() {
        const result = await prompt()
        const target = result.target
        const skip_page_count = result.skip_page_count

        const is_all = target.length == 0 || target.includes("all")

        console.log({ result, is_all, skip_page_count })

        if(is_all || target.includes("df-board")) {
            /**
             * 2023-02-03 07:03
             * Once scraped, only new posts need to be scraped
             */
        }
        
        if(is_all || target.includes("dunfaoff")) {

        }

        if(is_all || target.includes("dundam")) {

        }
    }
}

async function main() {
    await new Main().start()
}
main()