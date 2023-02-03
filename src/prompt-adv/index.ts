// NPM libs
import inquirer from "inquirer"

// My libs
import { classGenerator, advGenerator, Option } from "~/src/df-api"

export type AdvPromptResult = {
    class: "all" | any
    adv?: any
    is_buffer?: boolean
}

export async function promptAdv():Promise<AdvPromptResult> {
    const classes = Array.from(classGenerator({ include_json: true })).map((entry) => ({ name: entry.class_name, value: entry }))
    const result:AdvPromptResult = await inquirer.prompt([
        {
            name: "class",
            message: "캐릭터 선택",
            type: "list",
            choices: [...classes, "all"]
        },
    ])

    const class_name = result.class.class_name

    if(["all", "다크나이트", "크리에이터"].includes(class_name)) {
        return result
    }

    const advs = Array.from(advGenerator({ include_json: true }))
        .filter(entry => entry.class_name == class_name)
        .map(entry => ({ name: entry.adv_name, value: entry }))

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

    if(["크루세이더", "인챈트리스"].includes(adv_name)) {
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