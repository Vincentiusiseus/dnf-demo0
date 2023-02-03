// My libs
import { GetLastPageBase } from "~/src/get-last-page"
import { getPageData } from "~/features/dnf-forum-scrape/lib"

class MyGetLastPage extends GetLastPageBase {
    async getEntryCount(page: number): Promise<number> {
        const data = await getPageData(page)
        return data.length
    }
}

export async function getLastPage() {
    const inst = new MyGetLastPage()
    const page_total = await inst.start()
    return page_total
}