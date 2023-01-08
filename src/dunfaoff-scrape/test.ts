// My libs
import { makeRequest } from "./load-page"
import { scrapeCharData } from "./scrape"

async function makeRequest0() {
    /**
     * 2023-01-07 22:24
     * 이시간부 885 마지막 사람인 Davidofff가 886페이지에서 배열 앞쪽에 또 있음.
     */
    const res = await makeRequest({ "gender": "M", "jobName": "프리스트(남)", "jobGrowName": "태을선인", isHoly: false }, 886)
    return res
}

async function makeRequest1() {
    /**
     * 2023-01-08 19:40
     * 이시간부 849에서 보인 `적혈루_어뱅`이 사람이 850에서 보이고 851이후로 같은 페이지 반복
     */
    const param = { gender: <any>'M', isHoly: false, jobGrowName: '이모탈', jobName: '프리스트(남)' }
    const res = await makeRequest(param, 850)
    return res
}

async function main() {
    const res = await makeRequest1()
    const char_data = await scrapeCharData(res.data)
    console.log(char_data, char_data.length)
}
main()