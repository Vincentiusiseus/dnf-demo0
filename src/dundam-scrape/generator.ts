// Node libs
import * as fs from "fs"

export class Generator {
    jobs_data:any = null
    page:number = 1
    force_next = false
    debug_skip_flag = true
    
    constructor(public page_max:number) {
        const jobs_text = fs.readFileSync("./data/df-jobs-modified.json", "utf-8")
        this.jobs_data = JSON.parse(jobs_text)
    }

    forceNext() {
        this.force_next = true
    }

    * gen() {
        const char_names = Object.keys(this.jobs_data)
        for(const char_name of char_names) {
            const advs = this.jobs_data[char_name]
            const adv_names = Object.keys(advs)
            for(const adv_name of adv_names) {
                if(this.debug_skip_flag) {
                    if(adv_name == "섀도우댄서") {
                        this.debug_skip_flag = false
                    }
                    else {
                        continue
                    }
                }

                const awks = advs[adv_name]
                // console.log(output)
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