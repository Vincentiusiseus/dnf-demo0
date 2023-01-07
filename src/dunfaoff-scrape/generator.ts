// Node libs
import * as fs from "fs"

// My types
import type { Payload } from "./load-page"

/**
 * TODO 2023-01-07 12:00
 * 새로운 캐릭터 아처의 첫 전직 "뮤즈"도 버퍼임
 */
const BUFFER_ADV_NAMES = ["크루세이더", "인챈트리스"]
const GENDER_MAP:any = { "(남)": "M", "(여)": "F" }

function* paramGen() {
    const jobs_data = JSON.parse(fs.readFileSync("./data/df-jobs-modified.json", "utf-8"))
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

export class Generator {
    page:number = 1
    trigger_next:boolean = false
    constructor(public page_max:number) { }

    triggerNext() {
        this.trigger_next = true
    }

    *gen() {
        const param_generator = paramGen()
        for(const param of param_generator) {
            while(this.page <= this.page_max && this.trigger_next == false) {
                const output = Object.assign({}, param, { page: this.page })
                yield output
                this.page++
            }

            this.trigger_next = false
            this.page = 1
        }
    }
}