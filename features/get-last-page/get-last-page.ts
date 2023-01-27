export async function _getLastPage(start_page:number=1, payload:Payload):Promise<any> {
    let inc_page_flag = true
    let power = 0
    let output:any = { start_page }
    while(true) {
        const page = start_page + 2 ** power
        console.log(`Make request for page ${page}`)
        const response = await makeRequest(payload, page)
        const html_content = response.data
        const data = await scrapeCharData(html_content)
 
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

export async function getLastPage(payload:Payload):Promise<number> {
    let power = -1
    let output:any = null
    let count = 0
    while(true) {
        let first_page = output == null ? 0 : output.last_non_zero_page
        output = await _getLastPage(first_page, payload)
        count += output.first_zero_power + 1
        console.log(output)
        if(output.first_zero_power == 0) break
        power = output.last_non_zero_power
    }
    console.log(output, count)
    return output.start_page
}