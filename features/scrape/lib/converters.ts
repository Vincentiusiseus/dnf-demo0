// My libs
import { NO_ADVANCEMENT_CLASS_NAMES, getAdvJson } from "~/src/df-api"
// My types
import type { ClassEntry, AdvancementEntry } from "~/src/df-api" 

export { promptAdv, AdvPromptResult } from "~/src/prompt-adv"

export type Option = {
    is_skip_page_count: boolean
    is_iterate_all_advs?: boolean
}

const GENDER_MAP:any = { "(남)": "M", "(여)": "F" }

export function convertToDunfaoffPayload(adv_entry:AdvancementEntry, is_buffer:boolean) {
    let class_name = adv_entry.class_name
    let awk:string
    if(NO_ADVANCEMENT_CLASS_NAMES.includes(class_name)) {
        awk = class_name
    }
    else {
        const adv_name = adv_entry.adv_name
        const adv_data = getAdvJson(adv_name)

        let awk_node = adv_data.next
        while(awk_node.next.next != undefined) {
            awk_node = awk_node.next
        }
        awk = awk_node.jobGrowName
    }

    const gender_chars = class_name.substring(class_name.length - 3)
    const gender = gender_chars in GENDER_MAP ? GENDER_MAP[gender_chars] : ""
    if(gender != "") {
        class_name = class_name.slice(0,-3)
    }
    const payload = {
        gender,
        isHoly: is_buffer,
        jobGrowName: awk,
        jobName: class_name
    }
    return payload
}

export function convertToDundamArgs(adv_entry:AdvancementEntry) {
    const class_name = adv_entry.class_name
    if(NO_ADVANCEMENT_CLASS_NAMES.includes(class_name)) {
        return { class_name: "외전", neo_awk_name: `眞 ${class_name}` }
    }
    const adv_name = adv_entry.adv_name
    const adv_data = getAdvJson(adv_name)

    let awk_node = adv_data.next
    while(awk_node.next != undefined) {
        awk_node = awk_node.next
    }
    const neo_awk_name = awk_node.jobGrowName

    return { class_name, neo_awk_name }
}