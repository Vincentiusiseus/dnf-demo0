// NPM libs
import * as _ from "lodash"

// Node libs
import * as fs from "fs"

export class Generator {
    jobs_data:any = null
    page:number = 1
    trigger_next = false
    debug_skip_flag = true
    processed_char_adv_map:any = {}
    
    constructor(public page_max:number, public params:Iterable<any>) {
        const jobs_text = fs.readFileSync("./data/df-jobs-modified.json", "utf-8")
        this.jobs_data = JSON.parse(jobs_text)
    }

    triggerNext() {
        this.trigger_next = true
    }

    * gen() {
        for(const param of this.params) {
            while(this.page <= this.page_max && this.trigger_next == false) {
                const output = { ...param, page: this.page }
                yield output
                this.page++
            }

            this.page = 1
            this.trigger_next = false
        }
    }
}

export function* dealerParamGenerator() {
    const jobs_text = fs.readFileSync("./data/df-jobs-modified.json", "utf-8")
    const jobs_data = JSON.parse(jobs_text)

    const char_names = Object.keys(jobs_data)
    for(const char_name of char_names) {
        const advs = jobs_data[char_name]
        const adv_names = Object.keys(jobs_data[char_name])
        for(const adv_name of adv_names) {
            const awks = advs[adv_name]
            yield { _type: "dealer", char_name, adv_name, awks }
        }
    }
}

export function* bufferParamGenerator() {
    /**
     * 2023-01-08 20:12
     * 값:
     *   * 2 - 여크
     *   * 3 - 남크
     *   * 4 - 븜크
     */
    for(const job of [2,3,4]) {
        yield { _type: "buffer", job }
    }
}

function main() {
    const gen = dealerParamGenerator()
    for(const param of gen) {
        console.log(param)
    }

    const gen1 = bufferParamGenerator()
    for(const param of gen1) {
        console.log(param)
    }

    const gen_inst = new Generator(10, bufferParamGenerator())
    const gen2 = gen_inst.gen()
    for(const param of gen2) {
        console.log(param)
    }
}
// main()