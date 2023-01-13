// Node libs
import * as fs from "fs"

function parseJobsData() {
    const file_path = "./data/df-jobs.json"
    const json_content = JSON.parse(fs.readFileSync(file_path, "utf-8"))
    const char_infos = json_content.rows
    const output:any = {}

    for(const char_info of char_infos) {
        const char_name = char_info.jobName
        const adv_trees:any[] = char_info.rows
        for(const adv_tree of adv_trees) {
            let adv_node = adv_tree
            let neo_id = ""
            const advs:any[] = []
            while(adv_node != undefined) {
                advs.push(adv_node)
                if(adv_node.next == undefined) neo_id = adv_node.jobGrowId
                adv_node = adv_node.next
            }

            /**
             * 2023-01-13 15:33
             * 크리에이터와 다크나이트의 경우 각성 ID 같음...
             * 
             *   - 자각1은 `4fdee159d5aa8874a1459861ced676ec`
             *   - 자각2는 `da6a126f45370e1a4cbbe8823c6c35be`
             *   - 진각은 **둘다** `0a49d9c8b5e1358efff324e5cb11d41e`
             * 
             * 이 둘의 경우 jobId의 다름으로 구별해야함...
             * 
             *   - 다크나이트: 17e417b31686389eebff6d754c3401ea
             *   - 크리에이터: b522a95d819a5559b775deb9a490e49a
             * 
             * 2023-01-13 15:42
             * 크리에이터, 닼나 뿐만 아니라 겹치는 각성이름있을때 이럼. 아니 이러면 ID라고 칭하는 이유가 없는데.
             * 이런 경우 결국에는 'jobId'와 'jobGrowId' 둘다 필요함.
             * 
             * NeoId가 필요한게 아니라 그냥 둘다 필요함 ㅋㅋㅋ
             */
            for(const adv_node of advs) {
                const awk_name = adv_node.jobGrowName
                if(awk_name in output) {
                    const existing_id = adv_node.jobGrowId
                    const this_gender = char_name.includes("(남)") ? "M" : "F"
                    const existing_gender = this_gender == "M" ? "F" : "M"
                    output[awk_name] = {
                        [this_gender]: adv_node.jobGrowId,
                        [existing_gender]: existing_id
                    }
                }
                else {
                    output[awk_name] = neo_id
                }
            }
        }
    }

    return output
}

/**
 * 
 * @param {string} param_name 직업/각성 이름
 * @param {string} [gender] 남 - m,M,남, 여 - f,F,여
 */
export function mapParamsToNeoId(param_name:string, gender?:string) {
    const hash_map:any = {}
    let output:any = hash_map[param_name]

    if(typeof output != "string") {
        const _gender = "mM남".includes(gender) ? "M" : "fF여".includes(gender) ? "F" : undefined
        output = output[_gender]
    }

    return output
}

function test() {
    console.log(parseJobsData())
}
test()