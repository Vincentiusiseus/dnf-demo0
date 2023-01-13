import yargs from "yargs"


class Main {
    constructor() {

    }

    loadDfJobs() {
        
    }

    setupYargs() {
        const inst = yargs(process.argv)
        const result = inst.command("--awk", "Awakening 각성")

        const parsed = result.parse()
        console.log(parsed)
    }

    async start() {
        this.setupYargs()
    }
}

async function main() {
    await new Main().start()
}
main()