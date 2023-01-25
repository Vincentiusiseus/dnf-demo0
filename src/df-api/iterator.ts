// Node libs
import * as fs from "fs"
import * as path from "path"

type Option = {
    class_only?: boolean
    adv_only?: boolean
    awk_only?: boolean
    include_json?: boolean
}

export function * jobsDataGenerator(option?:Option) {
    const raw_content = fs.readFileSync(path.join(__dirname, "./data/jobs-res.json"), "utf-8")
    const res_data = JSON.parse(raw_content)
    const class_data = res_data.rows

    const is_no_filter = option == undefined ? true : Object.values(option).every(v => [undefined, false].includes(v))

    for(const class_entry of class_data) {
        const { jobId: class_id, jobName: class_name } = class_entry
        const advs = class_entry.rows

        const class_output = {
            class_id,
            class_name,
        }

        if(option != undefined && option.include_json) Object.assign( class_output, { class: class_entry, advs })

        if(is_no_filter || option.class_only)
            yield Object.assign({ is_pure_class: true }, class_output)

        for(const adv of advs) {
            const { jobGrowId: adv_id, jobGrowName: adv_name } = adv
            const awk_tree = adv.next

            const adv_output = {
                ...class_output,
                adv_id,
                adv_name,
            }
            
            if(option != undefined && option.include_json) Object.assign(adv_output, { adv, awk_tree })

            if(is_no_filter || option.adv_only)
                yield Object.assign({ is_pure_adv: true }, adv_output )

            let awk_node = awk_tree
            while(awk_node.next != undefined) {
                const { jobGrowId: awk_id, jobGrowName: awk_name } = awk_node
                const awk_next = awk_node.next
                const awk_output = {
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