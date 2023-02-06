// NPM libs
import inquirer from "inquirer"

// My libs
import { classGenerator, advGenerator, NO_ADVANCEMENT_CLASS_NAMES, BUFFER_ADV_NAMES } from "~/src/df-api"
// My types
import type { ClassEntry, AdvancementEntry } from "~/src/df-api"

export type AdvPromptResult = {
    is_all?: boolean
    class?: ClassEntry
    adv?: AdvancementEntry
    is_buffer?: boolean
}

export async function promptAdv():Promise<AdvPromptResult> {
    const classes = Array.from(classGenerator()).map((entry) => ({ name: entry.class_name, value: entry }))
    const result:AdvPromptResult = await inquirer.prompt([
        {
            name: "class",
            message: "캐릭터 선택",
            type: "list",
            choices: [...classes, { name: "all", value: { class_name: "all" } }]
        },
    ])

    const class_name = result.class.class_name

    if(["all"].includes(class_name)) {
        const result:AdvPromptResult = { is_all: true }
        return result
    }

    const advs = Array.from(advGenerator())
        .filter(entry => entry.class_name == class_name)
        .map(entry => ({ name: entry.adv_name, value: entry }))

    if(NO_ADVANCEMENT_CLASS_NAMES.includes(class_name)) {
        result.adv = advs[0].value
        return result
    }

    const adv_prompt = await inquirer.prompt([
        {
            name: "adv",
            message: "직업 선택",
            type: "list",
            choices: advs
        }
    ])
    Object.assign(result, adv_prompt)

    const adv_name = adv_prompt.adv.adv_name

    if(BUFFER_ADV_NAMES.includes(adv_name)) {
        const is_buffer_prompt = await inquirer.prompt([
            {
                name: "is_buffer",
                message: "버퍼(기본값) / 딜러(배틀크루)",
                type: "confirm",
                default: true
            }
        ])
        Object.assign(result, is_buffer_prompt)
    }

    return result
}