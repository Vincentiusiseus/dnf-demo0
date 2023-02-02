import inquirer from "inquirer"

type PromptResult = {
    target: Array<"df-board" | "dunfaoff" | "dundam" | "all">
    skip_page_count: boolean
}

export async function prompt() {
    const result:PromptResult = await inquirer.prompt([
        {
            name: "target",
            message: "스크레이핑 대상 (기본: all)",
            type: "checkbox",
            choices: [
                { name: "던파 게시판", value: "df-board" },
                { name: "던파오프", value: "dunfaoff" },
                { name: "던담", value: "dundam" },
                "all"
            ],
            /**
             * 2023-02-03 07:26
             * `default`가 체크되서 보여짐. 원치 않는 옵션이라면 유저가 체크해제 해야함.
             * 차라리 prompt 끝나고 기본값 매기는게 나을듯
             */
            // default: ["all"]
        },
        {
            name: "skip_page_count",
            message: "총 페이지 세기 스킵? (기본: 스킵 안함)",
            type: "confirm",
            default: false
        }
    ])
    return result
}