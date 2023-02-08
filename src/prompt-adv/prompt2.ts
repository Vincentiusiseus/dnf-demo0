// NPM libs
import inquirer from "inquirer"

// My libs
import { JobsIterator } from "~/src/df-api/iterator2"
import { NO_ADVANCEMENT_CLASS_NAMES, BUFFER_ADV_NAMES } from "~/src/df-api"

// My types
import type { ClassEntry, AdvEntry } from "~/src/df-api/iterator2"

export type AdvPromptResult = {
    is_all?: boolean
    class?: ClassEntry
    adv?: AdvEntry
}

type ClassChoice = { name:string, value:ClassEntry }
type AdvChoice = { name:string, value:AdvEntry }

export class PromptAdv {
    jobs_iterator:JobsIterator
    result:AdvPromptResult = {}
    classes:ClassChoice[]
    advs:AdvChoice[]

    constructor() { }

    async promptClass() {
        this.classes = Array.from(this.jobs_iterator.classGenerator()).map((entry) => ({ name: entry.class_name, value: entry }))
        return await inquirer.prompt([
            {
                name: "class",
                message: "캐릭터 선택",
                type: "list",
                choices: [...this.classes, { name: "all", value: { class_name: "all" } }]
            },
        ])
    }

    async promptAdv() {
        return await inquirer.prompt([
            {
                name: "adv",
                message: "직업 선택",
                type: "list",
                choices: this.advs
            }
        ])
    }

    async promptIsBuffer() {
        return await inquirer.prompt([
            {
                name: "is_buffer",
                message: "버퍼(기본값, Y) / 딜러(배틀크루, n)",
                type: "confirm",
                default: true
            }
        ])
    }

    async start() {
        this.jobs_iterator = new JobsIterator()
        const class_prompt_result = await this.promptClass()
        this.result.class = class_prompt_result.class

        const class_name = this.result.class.class_name

        if(["all"].includes(class_name)) {
            const result:AdvPromptResult = { is_all: true }
            return result
        }

        this.advs = Array.from(this.jobs_iterator.advGenerator({ include_awks: true }))
            .filter(entry => entry.class_name == class_name)
            .map(entry => ({ name: entry.adv_name, value: entry }))

        if(NO_ADVANCEMENT_CLASS_NAMES.includes(class_name)) {
            this.result.adv = this.advs[0].value
            return this.result
        }

        const adv_prompt = await this.promptAdv()
        this.result.adv = adv_prompt.adv

        const adv_name = adv_prompt.adv.adv_name
        if(BUFFER_ADV_NAMES.includes(adv_name)) {
            const is_buffer_prompt = await this.promptIsBuffer()

            this.result.adv.is_buffer = is_buffer_prompt.is_buffer
        }

        return this.result
    }
}

export async function promptAdv():Promise<AdvPromptResult> {
    const result = new PromptAdv().start()
    return result
}