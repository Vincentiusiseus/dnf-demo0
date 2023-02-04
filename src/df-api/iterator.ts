// Node libs
import * as fs from "fs"
import * as path from "path"

// My libs
import { BUFFER_ADV_NAMES, BUFFER_CLASS_NAMES, NO_ADVANCEMENT_CLASS_NAMES } from "./constants"

type IncludeJsonOption = {
    include_json?: boolean
}
type AdvOption = {
    distinguish_buffer?:boolean
} & IncludeJsonOption
export type Option = {
    class_only?: boolean
    adv_only?: boolean
    awk_only?: boolean
} & AdvOption
export type ClassEntry = {
    class_id:string
    class_name:string
    is_pure_class?:boolean
}
export type AdvancementEntry = ClassEntry & {
    adv_id: string
    adv_name: string
    is_pure_adv?:boolean
    is_buffer?:boolean
}
export type AwakeningEntry = AdvancementEntry & {
    awk_id:string
    awk_name:string
    is_pure_awk?:boolean
}

export function * jobsDataGenerator(option?:Option):Generator<ClassEntry|AdvancementEntry|AwakeningEntry> {
    const raw_content = fs.readFileSync(path.join(__dirname, "./data/jobs-res.json"), "utf-8")
    const res_data = JSON.parse(raw_content)
    const class_data = res_data.rows

    const is_no_filter = option == undefined ? true : Object.values(option).every(v => [undefined, false].includes(v))

    for(const class_entry of class_data) {
        const { jobId: class_id, jobName: class_name } = class_entry
        const advs = class_entry.rows

        const class_output:ClassEntry = {
            class_id,
            class_name,
        }

        if(option != undefined && option.include_json) Object.assign( class_output, { class: class_entry, advs })

        if(is_no_filter || option.class_only)
            yield Object.assign({ is_pure_class: true }, class_output)

        for(const adv of advs) {
            const { jobGrowId: adv_id, jobGrowName: adv_name } = adv
            const awk_tree = adv.next

            const adv_output:AdvancementEntry = {
                ...class_output,
                adv_id,
                adv_name,
            }

            if(option != undefined && option.include_json) Object.assign(adv_output, { adv, awk_tree })

            if(is_no_filter || option.adv_only) {
                if(option != undefined && option.distinguish_buffer) {
                    adv_output.is_buffer = false
                    yield Object.assign({ is_pure_adv: true }, adv_output )
                    if(BUFFER_CLASS_NAMES.includes(class_name) && BUFFER_ADV_NAMES.includes(adv_name)) {
                        adv_output.is_buffer = true
                        yield Object.assign({ is_pure_adv: true }, adv_output )
                    }
                }
                else {
                    yield Object.assign({ is_pure_adv: true }, adv_output )
                }
            }

            let awk_node = awk_tree
            while(awk_node != undefined) {
                const { jobGrowId: awk_id, jobGrowName: awk_name } = awk_node
                const awk_next = awk_node.next
                const awk_output:AwakeningEntry = {
                    ...adv_output,
                    awk_id,
                    awk_name,
                }

                if(option != undefined && option.include_json) Object.assign(adv_output, { awk: awk_node, awk_next })
                
                if(is_no_filter || option.awk_only)
                    yield Object.assign({ is_pure_awk: true }, awk_output)

                awk_node = awk_next
            }
        }
    }
}

export function * classGenerator(option?:IncludeJsonOption) {
    yield* <Generator<ClassEntry>> jobsDataGenerator(Object.assign({ class_only: true }, option))
}

export function * advGenerator(option?:AdvOption):Generator<AdvancementEntry> {
    //@ts-ignore
    yield* <Generator<AdvancementEntry>> jobsDataGenerator(Object.assign({ adv_only: true }, option))
}

export function * awkGenerator() {
    yield* <Generator<AwakeningEntry>> jobsDataGenerator({ awk_only: true })
}