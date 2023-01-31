import inquirer from "inquirer"

import { classGenerator, awkGenerator, advGenerator } from "~/src/df-api"

export type Task = "stat" | "ranking" | "total"
export type Prompt = {
    task: Task
    class: "all" | string
    adv?: string
    is_buffer?: boolean
}

export async function prompt():Promise<Prompt> {
    const class_names = Array.from(classGenerator()).map((entry) => entry.class_name)
    const result:Prompt = await inquirer.prompt([
        {
            name: "task",
            message: "기능 선택",
            type: "list",
            choices: [
                { name: "직업군 통계", value: "stat" },
                { name: "랭킹 업데이트", value: "ranking" },
                { name: "직업군 모험가 총합", value: "total" },
            ]
        },
        {
            name: "class",
            message: "캐릭터 선택",
            type: "list",
            choices: [...class_names, "all"]
        },
    ])

    if(["all", "다크나이트", "크리에이터"].includes(result.class)) {
        return result
    }

    const adv_names = Array.from(advGenerator())
        .filter(entry => entry.class_name == result.class)
        .map(entry => entry.adv_name)
    const adv_prompt = await inquirer.prompt([
        {
            name: "adv",
            message: "직업 선택",
            type: "list",
            choices: adv_names
        }
    ])
    Object.assign(result, adv_prompt)

    if(["크루세이더", "인챈트리스"].includes(adv_prompt.adv)) {
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