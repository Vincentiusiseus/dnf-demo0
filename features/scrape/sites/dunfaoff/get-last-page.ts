// My libs
import { GetLastPageBase } from "~/src/get-last-page"
import { makeRequest, Payload } from "~/features/dunfaoff-scrape/load-page"
import { scrapeCharData } from "~/features/dunfaoff-scrape/scrape"

class MyGetLastPage extends GetLastPageBase {
    constructor(public payload:Payload) { super() }

    async getEntryCount(page: number): Promise<number> {
        const response = await makeRequest(this.payload, page)
        const html_content = response.data
        const data = await scrapeCharData(html_content)
        return data.length
    }
}

export async function getLastPage(payload:Payload) {
    const inst = new MyGetLastPage(payload)
    const page_total = await inst.start()
    return page_total
}