// NPM libs
import { describe } from "yargs"
import inquirer from "inquirer"

class Main {
    async parseArgs() {
        const result = await inquirer.prompt([
            {
                name: "task",
                type: "list",
                // choices: ["직업군 통계", "랭킹 업데이트", "직업군 모험가 총합", "모험가 목록 업데이트"],
                choices: [
                    { name: "직업군 통계", value: "adv_stat" },
                    { name: "랭킹 업데이트", value: "adv_ranking" },
                    { name: "직업군 모험가 총합", value: "adventurer_total" },
                    { name: "모험가 목록 업데이트", value: "adventurer_names"}
                ]
            }
        ])

        console.log(result)
    }

    async start() {
        this.parseArgs()
    }
}

async function main() {
    await new Main().start()
}
main()