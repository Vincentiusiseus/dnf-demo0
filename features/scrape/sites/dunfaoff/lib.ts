// My libs
import { AdvPromptResult } from "~/src/prompt-adv"

export const BUFFER_ADV_NAMES = ["크루세이더", "인챈트리스"]
export const GENDER_MAP:any = { "(남)": "M", "(여)": "F" }

export function convertToDunfaoffPayload(prompt_result:AdvPromptResult) {
    const char_name = prompt_result.class.class_name
    const awk = ["크리에이터", "다크나이트"].includes(char_name) ? char_name : prompt_result.adv.adv_name
    const gender_chars  = char_name.substring(char_name.length - 3)
    const payload = {
        gender: gender_chars in GENDER_MAP ? GENDER_MAP[gender_chars] : "",
        isHoly: prompt_result.is_buffer,
        jobGrowName: awk,
        jobName: char_name
    }
    return payload
}