// Node libs
import * as fs from "fs"

// My libs
import { makeRequest } from "./load-page"
import { scrapeCharData } from "./scrape"
import { client } from "~/src/db"

// My types
import type { Payload } from "./load-page"

/**
 * TODO 2023-01-07 12:00
 * 새로운 캐릭터 아처의 첫 전직 "뮤즈"도 버퍼임
 */
const BUFFER_ADV_NAMES = ["크루세이더", "인챈트리스"]
const GENDER_MAP:any = { "(남)": "M", "(여)": "F" }

function* paramGen(jobs_data:any) {
    for(const char_name in jobs_data) {
        const advs = jobs_data[char_name]
        for(const adv in advs) {
            const awks:string[] = advs[adv]
            const gender_chars  = char_name.substring(char_name.length - 3)
            let awk = awks.slice(-2)[0]
            awk = awk.includes("자각") ? char_name : awk

            const output:Payload = {
                gender: gender_chars in GENDER_MAP ? GENDER_MAP[gender_chars] : "",
                isHoly: false,
                jobGrowName: awk,
                jobName: char_name
            }
            yield output
            if(BUFFER_ADV_NAMES.includes(adv)) {
                /**
                 * 2023-01-07 12:30
                 * 오브젝트 `yield`시 pass by reference 인듯. `output`을 덮어 쓰는 경우
                 * `isHoly = true`인 객채가 2번 나옴. Loop 사용시 이번 루프에서 키의 값은
                 * 달라보여도 reference는 같다고 나옴.
                 */
                const buffer_output = Object.assign({}, output)
                buffer_output.isHoly = true
                yield buffer_output
            }
        }
    }
}

async function main() {
    await client.connect()
    const db = client.db("dnf-data") 
    const collection = db.collection("dunfaoff-chars")

    const jobs_data = JSON.parse(fs.readFileSync("./data/df-jobs-modified.json", "utf-8"))
    const param_gen = paramGen(jobs_data)

    let index = 0
    for(const param of param_gen) {
        // console.log(index++, param)
        let page = 1
        const response = await makeRequest(param, page)
        const html_content = response.data
        const page_char_data = await scrapeCharData(html_content)
        const char_data = page_char_data.map((entry) => Object.assign({ param: { ...param, page } }, entry))
        
        if(char_data.length > 0) {
            await collection.insertMany(char_data)
        }
    }

    await client.close()
}
main()