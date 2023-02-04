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

export function convertToDunfaoffPayload(adv_entry:AdvancementEntry) {
    const char_name = adv_entry.class_name
    const awk = NO_ADVANCEMENT_CLASS_NAMES.includes(char_name) ? char_name : adv_entry.adv_name
    const gender_chars  = char_name.substring(char_name.length - 3)
    const payload = {
        gender: gender_chars in GENDER_MAP ? GENDER_MAP[gender_chars] : "",
        isHoly: adv_entry.is_buffer,
        jobGrowName: awk,
        jobName: char_name
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