import inquirer from "inquirer"

type PromptResult = {
    target: "df-board" | "dunfaoff" | "dundam" | "all"
}

export async function prompt() {
    const result = await inquirer.prompt([
        {
            name: "target",
            type: "checkbox",
            choices: [
                { name: "던파 게시판", value: "df-board" },
                { name: "던파오프", value: "dunfaoff" },
                { name: "던담", value: "dundam" },
                "all"
            ]
        }
    ])
    return result
}