// Node libs
import * as fs from "fs"

class Params {
    jobs_data:any
    char_names:string[]
    adv_names:string[]

    cur_char_name:string
    cur_adv_name:string
    page:number

    empty_page = false
    is_done = false

    constructor() {
        const jobs_text = fs.readFileSync("./data/df-jobs-modified.json", "utf-8")
        this.jobs_data = JSON.parse(jobs_text)

        this.char_names = Object.keys(this.jobs_data)
        this.cur_char_name = this.char_names.shift()
        this.adv_names = Object.keys(this.jobs_data[this.cur_char_name])
        this.cur_adv_name = this.adv_names.shift()
        this.page = 1
    }

    hadEmptyPage() {
        this.empty_page = true
    }

    updateNextAdv() {
        this.empty_page = false
        if(this.adv_names.length == 0) {
            this.cur_char_name = this.char_names.shift()
            if(this.cur_char_name == undefined) {
                this.cur_adv_name = undefined
                return
            }
            this.adv_names = Object.keys(this.jobs_data[this.cur_char_name])
        }
        this.cur_adv_name = this.adv_names.shift()
        this.page = 1
    }

    [Symbol.iterator]() {
        return {
            next:() => {
                if(this.empty_page) {
                    this.updateNextAdv()
                }

                return {
                    value: [this.cur_char_name, this.cur_adv_name, this.page++],
                    done: this.cur_char_name == undefined,
                }
            }
        }
    }
}

function main() {
    const param = new Params()
    const iter = param[Symbol.iterator]()
    console.log(iter.next())
    console.log(iter.next())
    console.log(iter.next())
    console.log(iter.next())
    param.hadEmptyPage()
    console.log(param[Symbol.iterator]().next())
    console.log(param[Symbol.iterator]().next())
    console.log(param[Symbol.iterator]().next())
    console.log(param[Symbol.iterator]().next())
    param.hadEmptyPage()
    console.log(param[Symbol.iterator]().next())
    param.hadEmptyPage()
    console.log(param[Symbol.iterator]().next())
    param.hadEmptyPage()
    console.log(param[Symbol.iterator]().next())
    param.hadEmptyPage()
    console.log(param[Symbol.iterator]().next())
    param.hadEmptyPage()
    console.log(param[Symbol.iterator]().next())
    param.hadEmptyPage()
    console.log(param[Symbol.iterator]().next())
    param.hadEmptyPage()
    let iter_return = { done: false }
    while(iter_return.done == false) {
        iter_return = param[Symbol.iterator]().next()
        console.log(iter_return)
        param.hadEmptyPage()
    }

    const param1 = new Params()
    const iter1 = param1[Symbol.iterator]()
    let value:any = null
    while((value = iter1.next()).done == false) {
        console.log(value)
        param1.hadEmptyPage()
    }
}
main()