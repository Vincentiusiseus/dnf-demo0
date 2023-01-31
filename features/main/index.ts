// NPM libs
import { describe } from "yargs"

// My libs
import { prompt } from "./prompt"

class Main {
    async parseArgs() {
    }

    async start() {
        this.parseArgs()
    }
}

async function main() {
    // await new Main().start()
    console.log(await prompt())
}
main()