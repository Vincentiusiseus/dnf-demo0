// NPM libs
import yargs from "yargs"

// My libs
import { classGenerator, advGenerator } from "~/src/df-api"

class Main {
    parsed:any

    constructor() {

    }

    /**
     * 2023-01-27 14:29
     * 선택 옵션 B가 딴 옵션 A에 의존하는 경우는 Inquirer가 100배 더 잘어울리는듯.
     * 애초에 yargs는 `option` API에 이런 기능이 존재하지 않고, 솔직히 생각 좀더
     * 해보니 나도 필요 없다고 생각하긴 함.
     * 
     * 어쨌든 내가 원하는 API는...
     * 
     * option 두번째 인수를 JSON 만 받는게 아니라 함수도 받고 함수의 매개변수로
     * `parsed`가 존재. 해단 `.option`까지 parse한 값. 이 함수는 `.option`이 두번째
     * 인수와 같은 타입을 반환.
     */
    parseArgs() {
        this.parsed = yargs(process.argv)
            .option("site", {
                alias: "s",
                description: "Target site",
                demandOption: true,
                choices: ["df-forum", "dundam", "dunfaoff"]
            })
            .parse()
        
        const site = this.parsed["site"]
        if(site == "df-forum") {
            return
        }

        const classes = Array.from(classGenerator())
        const class_names = classes.map(entry => entry.class_name)

        const parsed_class_name = yargs(process.argv)
            .option("class-name", {
                alias: "c",
                description: "One of 16 class names",
                demandOption: true,
                choices: class_names
            })
            .parse()

        // @ts-ignore
        const class_name = parsed_class_name["class-name"]

        const all_advs = Array.from(advGenerator())
        const class_advs = all_advs.filter(entry => entry.class_name == class_name)
        // @ts-ignore
        const adv_names = class_advs.map(entry => entry.adv_name)

        if(["크리에이터", "다크나이트"].includes(class_name)) {
            return
        }

        const parsed_adv_name = yargs(process.argv)
            .option("adv-name", {
                alias: "a",
                description: "One of 4~5 Advancements from a class",
                demandOption: true,
                choices: adv_names
            })
            .parse()
        
        console.log(parsed_adv_name)
    }

    async start() {
        this.parseArgs()
        console.log(this.parsed)
    }
}

async function main() {
    await new Main().start()
}
main()