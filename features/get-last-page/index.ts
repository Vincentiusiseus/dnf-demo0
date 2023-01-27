// NPM libs
import { AxiosError } from "axios"
import yargs from "yargs"

// My libs
import { classGenerator, advGenerator, awkGenerator } from "~/src/df-api"
import { getLastPage as getLastPageDFForum } from "../dnf-forum-scrape/lib"
import { getLastPage as getLastPageDundam } from "../dundam-scrape/get-last-page"
import { getLastPage as getLastPageDunfaoff } from "../dunfaoff-scrape/get-last-page"

// My types
import type { Payload } from "../dunfaoff-scrape/load-page"

class Main {
    site:string
    class_name:string
    adv_name:string

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
        const parsed_site = yargs(process.argv)
            .option("site", {
                alias: "s",
                description: "Target site",
                demandOption: true,
                choices: ["df-forum", "dundam", "dunfaoff"]
            })
            .parse()
        
        // @ts-ignore
        this.site = parsed_site["site"]
        if(this.site == "df-forum") {
            return
        }

        const classes = Array.from(classGenerator())
        const class_names = classes.map(entry => entry.class_name)

        const parsed_class_name = yargs(process.argv)
            .option("class-name", {
                alias: "c",
                description: "One of 16 class names + all",
                demandOption: true,
                choices: [...class_names, "all"]
            })
            .parse()

        // @ts-ignore
        this.class_name = parsed_class_name["class-name"]

        if(this.class_name == "all") {
            return
        }

        const all_advs = Array.from(advGenerator())
        const class_advs = all_advs.filter(entry => entry.class_name == this.class_name)
        // @ts-ignore
        const adv_names = class_advs.map(entry => entry.adv_name)

        if(["크리에이터", "다크나이트"].includes(this.class_name)) {
            // Do nothing
        }
        else {
            const parsed_adv_name = yargs(process.argv)
                .option("adv-name", {
                    alias: "a",
                    description: "One of 4~5 Advancements from a class",
                    demandOption: true,
                    choices: adv_names
                })
                .parse()
            //@ts-ignore
            this.adv_name = parsed_adv_name["adv-name"]
        }
    }

    async requestForAdv(_class_name:string, adv_name:string) {
        if(this.site == "dundam") {
            const is_special = ["크리에이터", "다크나이트"].includes(_class_name)
            const class_name = is_special ? "외전" : _class_name
            const neo_awk_name = "眞 " + (is_special ? this.class_name : adv_name)

            console.log(class_name, neo_awk_name)
            return await getLastPageDundam(class_name, neo_awk_name)
        }
        else if(this.site == "dunfaoff") {
            const is_special = ["크리에이터", "다크나이트"].includes(_class_name)
            let awk_name:string
            if(is_special) awk_name = _class_name
            else {
                //@ts-ignore
                const awk_names = Array.from(awkGenerator()).filter(entry => entry.adv_name == adv_name && entry.class_name == _class_name).map(entry => entry.awk_name)
                console.log(awk_names)
                //@ts-ignore
                awk_name = awk_names.slice(-2)[0]
            }

            const payload:Payload = {
                gender: this.class_name.includes("남") ? "M" :  this.class_name.includes("(여)") ? "F" : "",
                isHoly: false,
                jobGrowName: awk_name,
                jobName: this.class_name
            }

            let count = 0
            let result:any = null
            while(true) {
                try {
                    result = await getLastPageDunfaoff(payload)
                }
                catch(e) {
                    if(e instanceof AxiosError && e.response.status == 500) {
                        const MAX_COUNT = 5
                        const WAIT_S = 10
                        console.log(`Caught error code 500 for payload ${payload}. Wait ${WAIT_S} seconds just in case, and increment count ${++count}/${MAX_COUNT}`)
                        await new Promise((res) => setTimeout(() => res(0), WAIT_S * 10000))
                        if(count >= 5) throw e
                    }
                }
                break
            }
            return result
        }
    }

    async start() {
        this.parseArgs()
        console.log(this.site, this.class_name, this.adv_name)

        if(this.site == "df-forum") {
            await getLastPageDFForum()
            return
        }

        let params:any[] = []
        /**
         * 2023-01-27 16:23
         * TODO: 아 또 버퍼 까먹음;;;
         * Iterator에 "include buffer", buffer_only 이런 옵션도 넣어야 겠음.
         */
        if(this.class_name == "all") {
            const class_names = Array.from(classGenerator()).map(entry => entry.class_name)
            for(const class_name of class_names) {
                const advs = Array.from(advGenerator()).filter(entry => entry.class_name == class_name)
                for(const adv of advs) {
                    //@ts-ignore
                    const adv_name = adv.adv_name
                    params.push([class_name, adv_name])
                }
            }
        }
        else {
            params.push([this.class_name, this.adv_name])
        }

        console.log(params)

        const result:any = []
        for(const param of params) {
            //@ts-ignore
            const last_page = await this.requestForAdv(...param)
            result.push({ param, last_page })
            console.log(result)
        }

        console.log(result)
    }
}

async function main() {
    await new Main().start()
}
main()