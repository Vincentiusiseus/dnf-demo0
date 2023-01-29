// Node libs
import * as fs from "fs"
import * as path from "path"

type Option = {
    class_only?: boolean
    adv_only?: boolean
    distinguish_buffer?:boolean
    awk_only?: boolean
    include_json?: boolean
}
type ClassEntry = {
    class_id:string
    class_name:string
    is_pure_class?:boolean
}
type AdvancementEntry = ClassEntry & {
    adv_id: string
    adv_name: string
    is_pure_adv?:boolean
    is_buffer?:boolean
}
type AwakeningEntry = AdvancementEntry & {
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
                    if(["프리스트(남)", "프리스트(여)", "마법사(여)"].includes(class_name) && ["크루세이더", "인챈트리스"].includes(adv_name)) {
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

export function * classGenerator() {
    yield* jobsDataGenerator({ class_only: true })
}

export function * advGenerator() {
    yield* jobsDataGenerator({ adv_only: true })
}

export function * awkGenerator() {
    yield* jobsDataGenerator({ awk_only: true })
}