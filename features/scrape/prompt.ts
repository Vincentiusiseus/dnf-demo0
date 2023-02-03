import inquirer from "inquirer"


type PromptResult = {
    target: Array<"df-board" | "dunfaoff" | "dundam" | "all">
    is_skip_page_count: boolean
    is_iterate_all_advs: boolean
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
            name: "is_skip_page_count",
            message: "총 페이지 세기 스킵? (기본: 스킵 안함)",
            type: "confirm",
            default: false
        }
    ])

    //@ts-ignore
    if(["all", "dunfaoff", "dundam"].some(target => result.target.includes(target))) {
        const prompt1_result = await inquirer.prompt([
            {
                name: "is_iterate_all_advs",
                message: "직업군 선택 가능한 사이트가 존재합니다. 모든 직업군을 대상으로 스크레이핑 하겠습니까? (기본: 아니요)",
                default: false,
                type: "confirm"
            }
        ])

        Object.assign(result, prompt1_result)
    }

    return result
}