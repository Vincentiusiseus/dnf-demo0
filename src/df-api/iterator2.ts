// Node libs
import * as fs from "fs"
import * as path from "path"

// My libs
import { BUFFER_ADV_NAMES, BUFFER_CLASS_NAMES, NO_ADVANCEMENT_CLASS_NAMES } from "./constants"

export type ClassGeneratorOption = {
    include_original_data?:boolean
}

export type AdvGeneratorOption = {
    include_awks?:boolean
    distinguish_buffer?:boolean
}

export type ClassEntry = {
    class_id:string
    class_name:string
    original_data?:any
}

export type AwkEntry = {
    awk_id:string
    awk_name:string
}

export type AdvEntry = {
    class_id:string
    class_name:string
    adv_id:string
    adv_name:string
    awks?:AwkEntry[]
    is_buffer?:boolean
}

export class JobsIterator {
    constructor() {
    }

    * classGenerator(option?:ClassGeneratorOption) {
        const raw_content = fs.readFileSync(path.join(__dirname, "./data/jobs-res.json"), "utf-8")
        const res_data = JSON.parse(raw_content)
        const class_data = res_data.rows

        for(const class_entry of class_data) {
            const { jobId: class_id, jobName: class_name } = class_entry

            const class_output:ClassEntry = {
                class_id,
                class_name,
            }

            if(option != undefined && option.include_original_data) {
                class_output.original_data = class_entry
            }
            yield class_output
        }
    }

    * advGenerator(option?:AdvGeneratorOption) {
        const class_gen = this.classGenerator({ include_original_data: true })
        while(true) {
            const gen_result = class_gen.next()
            if(gen_result.done) {
                break
            }
            const class_entry = <ClassEntry> gen_result.value
            const { class_id, class_name } = class_entry
            const original_data = class_entry.original_data
            const advs = original_data.rows

            for(const adv of advs) {
                const { jobGrowId: adv_id, jobGrowName: adv_name } = adv

                const adv_entry:AdvEntry = { class_id, class_name, adv_id, adv_name }

                if(option != undefined && option.include_awks) {
                    let awk_node = adv.next
                    const awks:AwkEntry[] = []
                    while(awk_node != undefined) {
                        const { jobGrowId: awk_id, jobGrowName: awk_name } = awk_node
                        const awk:AwkEntry = {
                            awk_id, awk_name
                        }
                        awks.push(awk)
                        awk_node = awk_node.next
                    }
                    adv_entry.awks = awks
                }

                if(option != undefined && option.distinguish_buffer == true) {
                    const class_name = class_entry.class_name
                    if(BUFFER_CLASS_NAMES.includes(class_name) && BUFFER_ADV_NAMES.includes(adv_name)) {
                        adv_entry.is_buffer = true
                        yield adv_entry
                        adv_entry.is_buffer = false
                        yield adv_entry
                    }
                    else {
                        yield adv_entry
                    }
                }
                else {
                    yield adv_entry
                }
            }
        }
    }
}

async function main() {
    // const output = Array.from(new JobsIterator().classGenerator())
    // const output = Array.from(new JobsIterator().advGenerator())
    const output = Array.from(new JobsIterator().advGenerator({ include_awks: true, distinguish_buffer: true }))
    console.dir(output, { depth: 10 })
}
main()