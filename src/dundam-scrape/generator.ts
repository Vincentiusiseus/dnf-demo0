// NPM libs
import * as _ from "lodash"

// Node libs
import * as fs from "fs"

export class Generator {
    jobs_data:any = null
    page:number = 1
    force_next = false
    debug_skip_flag = true
    processed_char_adv_map:any = {}
    
    constructor(public page_max:number) {
        const jobs_text = fs.readFileSync("./data/df-jobs-modified.json", "utf-8")
        this.jobs_data = JSON.parse(jobs_text)
        // this.jobs_data = _.pick(this.jobs_data, "프리스트(남)")
        // this.jobs_data["프리스트(남)"] = _.pick(this.jobs_data["프리스트(남)"], ["퇴마사", "어벤저"])
        // console.log(this.jobs_data)
    }

    /**
     * TODO 2023-01-06 13:34
     * `force` 보다 trigger이라고 정정하기
     */
    forceNext() {
        this.force_next = true
    }

    * gen() {
        const char_names = Object.keys(this.jobs_data)
        for(const char_name of char_names) {
            const advs = this.jobs_data[char_name]
            const adv_names = Object.keys(advs)
            for(const adv_name of adv_names) {
                // if(this.debug_skip_flag) {
                //     if(adv_name == "히트맨") {
                //         this.debug_skip_flag = false
                //     }
                //     else {
                //         continue
                //     }
                // }

                const awks = advs[adv_name]
                while(this.page <= this.page_max && this.force_next == false) {
                    const output = [char_name, adv_name, awks, this.page]
                    yield output
                    this.page++
                }

                this.page = 1
                this.force_next = false
            }
        }
    }
}
function paramGenerator() {
    const jobs_text = fs.readFileSync("./data/df-jobs-modified.json", "utf-8")
    const jobs_data = JSON.parse(jobs_text)

    const char_names = Object.keys(jobs_data)
    for(const char_name of char_names) {
        const adv_names = Object.keys(jobs_data[char_name])
        for(const adv_name of adv_names) {
            console.log(char_name, adv_name, jobs_data[char_name][adv_name])
        }
    }
}

function main() {
    const inst = new Generator(1)
    const generator = inst.gen()
    // console.log(generator.next())
    // console.log(generator.next())
    // console.log(generator.next())

    // console.log("Before while")
    let value:any
    while((value = generator.next()).done == false) {
        console.log(value)
        // console.log(generator.next())
        // console.log(generator.next())
    }
}
// main()