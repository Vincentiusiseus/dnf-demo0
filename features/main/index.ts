// NPM libs
import { describe } from "yargs"

// My libs
import { prompt, PromptResult } from "./prompt"

class Main {
    prompt_result:PromptResult
    async start() {
        this.prompt_result = await prompt()
    }
}

async function main() {
    await new Main().start()
}
main()