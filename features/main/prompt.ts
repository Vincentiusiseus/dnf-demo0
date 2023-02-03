import inquirer from "inquirer"

// My libs
import { promptAdv, AdvPromptResult } from "~/src/prompt-adv"

export type Task = "stat" | "ranking" | "total"
export type PromptResult = {
    task: Task
} & AdvPromptResult

export async function prompt():Promise<PromptResult> {
    const result:PromptResult = await inquirer.prompt([
        {
            name: "task",
            message: "기능 선택",
            type: "list",
            choices: [
                { name: "직업군 통계", value: "stat" },
                { name: "랭킹 업데이트", value: "ranking" },
                { name: "직업군 모험가 총합", value: "total" },
            ]
        }
    ])

    const adv_result = await promptAdv()
    Object.assign(result, adv_result)

    return result
}