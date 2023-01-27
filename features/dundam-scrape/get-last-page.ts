import { requestDealerData, requestBufferData } from "./load-page"

export async function _getLastPage(start_page:number=1, class_name:string, neo_awk_name:string):Promise<any> {
    let inc_page_flag = true
    let power = 0
    let output:any = { start_page }
    while(true) {
        const page = start_page + 2 ** power
        console.log(`Make request for page ${page}`)
        const res_data = await requestDealerData(page, class_name, neo_awk_name)
        const data = res_data.ranking
        console.log(page, power, data.length)
        // console.log(data)

        output.last_non_zero_page = output.page
        output.last_non_zero_power = output.first_zero_power
        output.page = page
        output.first_zero_power = power

        if(inc_page_flag) {
            if(data.length == 0) {
                inc_page_flag = false
                break
            }
            else power++
        }
    }
    return output
}

export async function getLastPage(class_name:string, neo_awk_name:string):Promise<number> {
    let power = -1
    let output:any = null
    let count = 0
    while(true) {
        let first_page = output == null ? 0 : output.last_non_zero_page
        output = await _getLastPage(first_page, class_name, neo_awk_name)
        count += output.first_zero_power + 1
        console.log(output)
        if(output.first_zero_power == 0) break
        power = output.last_non_zero_power
    }
    console.log(output, count)
    return output.start_page
}

async function main() {
    /**
     * 2023-01-27 12:29
     * `4873`줘서 직접 확인해보니 `4874`로 늘어있음... 그걸떠나서 현제 꼴등 순위가
     * `48731`위... 4.8만 명의 웨펀마스터... 이건좀...
     */
    await getLastPage("귀검사(남)", "眞 웨펀마스터")
}
// main()