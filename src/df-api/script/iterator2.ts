// NPM libs
import yargs from "yargs"

// My libs
import { JobsIterator } from "../iterator2"

function main() {
    const parsed_output:any = yargs(process.argv.slice(2))
        .command("class", "Get class iterator output", {
            "original-data": {
                alias: "o",
                type: "boolean"
            }
        })
        .command("adv", "Get advancement iterator output", {
            "awakening": {
                alias: "a",
                type: "boolean"
            },
            "distinguish-buffer": {
                alias: "b",
                type: "boolean"
            }
        })
        .help()
        .argv

    //@ts-ignore
    const command_name = parsed_output._[0]

    const inst = new JobsIterator()

    if(command_name == "class") {
        const generator = inst.classGenerator({ include_original_data: parsed_output["original-data"] })
        const gen_arr = Array.from(generator)
        console.log(gen_arr, gen_arr.length)
    }
    else if(command_name == "adv") {
        const generator = inst.advGenerator({
            distinguish_buffer: parsed_output["distinguish-buffer"],
            include_awks: parsed_output["awakening"]
        })
        const gen_arr = Array.from(generator)
        console.log(gen_arr, gen_arr.length)
    }
}
main()