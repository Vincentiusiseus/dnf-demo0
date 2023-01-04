// Node libs
import * as fs from "fs"

class Generator {
    jobs_data:any = null
    page:number = 1
    had_empty_page = false
    
    constructor() {
        const jobs_text = fs.readFileSync("./data/df-jobs-modified.json", "utf-8")
        this.jobs_data = JSON.parse(jobs_text)
    }

    hadEmptyPage() {
        this.had_empty_page = true
    }
    
    * gen() {
        const char_names = Object.keys(this.jobs_data)
        for(const char_name of char_names) {
            const advs = this.jobs_data[char_name]
            const adv_names = Object.keys(advs)
            for(const adv_name of adv_names) {
                const awks = advs[adv_name]
                // console.log(output)
                while(this.had_empty_page == false) {
                    const output = [char_name, adv_name, awks, this.page]
                    yield output
                    this.page++
                }

                this.page = 1
                this.had_empty_page = false 
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
    const inst = new Generator()
    const generator = inst.gen()
    console.log(generator.next())
    console.log(generator.next())
    inst.hadEmptyPage()
    console.log(generator.next())

    console.log("Before while")
    let value:any
    while((value = generator.next()).done == false) {
        console.log(value)
        console.log(generator.next())
        console.log(generator.next())
        inst.hadEmptyPage()
    }
}
main()