import { prompt } from "./prompt"

class Main {
    async start() {
        const result = await prompt()
        console.log(result)
    }
}

async function main() {
    await new Main().start()
}
main()