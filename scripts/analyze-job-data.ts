// Node libs
import * as fs from "fs"

class Main {
    char_infos:any[]
    count_advs:any
    count_awks:any
    all_names:any[] = []
    all_unique_names:any[] = []

    constructor() {

    }

    *genAdvs() {
        for(const char_info of this.char_infos) {
            const char_name = char_info.jobName
            const adv_roots:any[] = char_info.rows
            for(const adv_root of adv_roots) {
                const adv_name = adv_root.jobGrowName
                yield { char_info, char_name, adv_root, adv_name }
            }
        }
    }

    *genAwks() {
        const adv_info_gen = this.genAdvs()
        for(const adv_info of adv_info_gen) {
            let awk_node = adv_info.adv_root.next
            while(awk_node != undefined) {
                const awk_name = awk_node.jobGrowName
                yield { ...adv_info, awk_node, awk_name }
                awk_node = awk_node.next
            }
        }
    }

    *gen() {
        const adv_info_gen = this.genAdvs()
        for(const adv_info of adv_info_gen) {
            yield { ...adv_info, is_awk: false }
            let awk_node = adv_info.adv_root.next
            while(awk_node != undefined) {
                const awk_name = awk_node.jobGrowName
                yield { ...adv_info, is_awk: true, awk_node, awk_name }
                awk_node = awk_node.next
            }
        }
    }

    countAdvNames() {
        const generator = this.genAdvs()
        const count:any = {}
        for(const adv_info of generator) {
            const { adv_name } = adv_info
            console.log(adv_name)
            count[adv_name] = adv_name in count ? count[adv_name] + 1 : 1
        }
        return count
    }

    countAwkNames() {
        const generator = this.genAwks()
        const count:any = {}
        for(const awk_info of generator) {
            const { awk_name } = awk_info
            count[awk_name] = awk_name in count ? count[awk_name] + 1 : 1
        }
        return count
    }

    loadAllNames() {
        const generator = this.gen()
        for(const param of generator) {
            //@ts-ignore
            this.all_names.push(param.is_awk ? param.awk_name : param.adv_name)
        }
        return this.all_names
    }

    loadAllUniqueNames() {
        this.all_unique_names = Array.from(new Set(this.all_names))
        return this.all_unique_names
    }

    getRedundantAwks() {
        const generator = this.genAwks()
        const redundant_adv_names:any[] = []
        for(const param of generator) {
            const { awk_name } = param
            if(this.count_awks[awk_name] > 1) {
                redundant_adv_names.push(awk_name)
            }
        }
    }

    start() {
        const file_path = "./data/df-jobs.json"
        const json_content = JSON.parse(fs.readFileSync(file_path, "utf-8"))
        this.char_infos = json_content.rows
        this.count_advs = this.countAdvNames()
        console.log(this.count_advs)
        this.count_awks = this.countAwkNames()
        console.log(this.count_awks)

        const filterUniqueKeys = (count_map:any) => {
            const filtered:any = {}
            const entries = Object.entries(count_map)
            for(const [key, count] of entries) {
                if(count > 1) filtered[key] = count
            }
            return filtered
        }

        console.log(filterUniqueKeys(this.count_advs))
        console.log(filterUniqueKeys(this.count_awks))
        console.log(this.loadAllNames(), this.all_names.length)
        console.log(this.loadAllUniqueNames(), this.all_unique_names.length)
    }
}

async function main() {
    new Main().start()
}
main()