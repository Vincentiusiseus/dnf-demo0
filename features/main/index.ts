// NPM libs
import { describe } from "yargs"

// My libs
import { prompt, PromptResult } from "./prompt"

import {} from "../get-stat"
import {} from "../get-last-page"

class Main {
    prompt_result:PromptResult
    async start() {
        this.prompt_result = await prompt()

        const task = this.prompt_result.task
        if(task == "stat") {

        }
        else if(task == "total") {

        }
        else if(task == "ranking") {

        }
    }
}

async function main() {
    await new Main().start()
}
main()