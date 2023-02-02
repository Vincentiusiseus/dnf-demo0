type Progress = {
    start_page:number
    last_non_zero_page:number
    last_non_zero_power:number
    page:number
    first_zero_power:number
}

export abstract class GetLastPageBase {
    abstract getEntryCount(page:number): Promise<number>

    async _getLastPage(start_page:number=1):Promise<any> {
        let inc_page_flag = true
        let power = 0
        //@ts-ignore
        let output:Progress = { start_page }
        while(true) {
            const page = start_page + 2 ** power
            console.log(`Make request for page ${page}`)
            const data_count = await this.getEntryCount(page)
    
            console.log(page, power, data_count)
            // console.log(data)

            output.last_non_zero_page = output.page
            output.last_non_zero_power = output.first_zero_power
            output.page = page
            output.first_zero_power = power

            if(inc_page_flag) {
                if(data_count == 0) {
                    inc_page_flag = false
                    break
                }
                else power++
            }
        }
        return output
    }

    async start() {
        let power = -1
        let output:Progress = null
        let count = 0
        while(true) {
            let first_page = output == null ? 0 : output.last_non_zero_page
            output = await this._getLastPage(first_page)
            count += output.first_zero_power + 1

            console.log(output)

            if(output.first_zero_power == 0) break
            power = output.last_non_zero_power
        }
        console.log(output, count)
        return output.start_page
    }
}