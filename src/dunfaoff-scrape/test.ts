// My libs
import { makeRequest } from "./load-page"
import { scrapeCharData } from "./scrape"

async function main() {
    /**
     * 2023-01-07 22:24
     * 이시간부 885 마지막 사람인 Davidofff가 886페이지에서 배열 앞쪽에 또 있음.
     */
    const res = await makeRequest({ "gender": "M", "jobName": "프리스트(남)", "jobGrowName": "태을선인", isHoly: false }, 886)
    const char_data = await scrapeCharData(res.data)
    console.log(char_data, char_data.length)
}
main()