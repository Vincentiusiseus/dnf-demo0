import { AdvPromptResult } from "~/src/prompt-adv"

export function convertToDundamArgs(prompt_result:AdvPromptResult) {
    const output:any[] = []
    const class_name = prompt_result.class.class.jobName
    if(["다크나이트", "크리에이터"].includes(class_name)) {
        return { class_name: "외전", neo_awk_name: `眞 ${class_name}` }
    }
    output.push(class_name)

    let awk_node = prompt_result.adv.awk_tree.next
    while(awk_node.next != undefined) {
        awk_node = awk_node.next
    }
    const neo_awk_name = awk_node.jobGrowName

    return { class_name, neo_awk_name }
}