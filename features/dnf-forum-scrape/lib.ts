// Node libs
import * as crypto from "crypto"
import * as https from "https"

// NPM libs
import _axios, { AxiosResponse } from "axios"
import { JSDOM } from "jsdom"
import iconv from "iconv-lite"

// My libs
import { GetLastPageBase } from "~/src/get-last-page"


const axios = _axios.create({
    httpsAgent: new https.Agent({
        keepAlive: true,
        /**
         * 2022-12-31 16:16
         * Prevent `SSL routines:final_renegotiate:unsafe legacy renegotiation disabled`
         * */
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
    })
})

const BASE_URL = `https://df.nexon.com/df/community/dnfboard?mode=list&order=reg_date&order_type=DESC`


export function scrapePostData(jsdom:JSDOM) {
    const document = jsdom.window.document
    /**
     * 2023-01-02 10:03
     * JSDOM에서는 `:has(th)` pseudo class 지원 안하는듯
     */
    const post_row_elements = document.querySelectorAll("table.tbl tr:not(.ntc)")
    let post_row_array = Array.from(post_row_elements)
    post_row_array = post_row_array.filter(row => row.querySelector("th") == null && row.querySelector("td.author") != null)

    const output = []
    for(const post_row of post_row_array) {
        // if(post_row.querySelector("th") != null) continue;
        const post_link_el = post_row.querySelector(".tit a")
        /**
         * 2023-01-01 14:05
         * "신고에 의해 숨김 처리된 게시물입니다" has no `a` element under `td.tit`
         */
        if(post_link_el == null) continue 
        const post_link = post_link_el.getAttribute("href")
        const post_sp = new URLSearchParams(post_link)
        const post_id = post_sp.get("no")
        const target_el = post_row.querySelector(".author span")
        /**
         * 2023-01-01 11:58
         * data-key에 유저 id, data-sv에 1-indexed 서버 index 있지만 최대한 많은 유저를 찾는것이 목표 이기 때문에
         * 스킵
         */
        const user_name = target_el.textContent.trim()
        const date = post_row.querySelector("td:nth-child(3)").textContent.trim()

        output.push({ user_name, post_id, date, post_link })
    }
    return output
}

export async function loadPage(page:number):Promise<Buffer> {
    const url = new URL("", BASE_URL)
    url.searchParams.append("page", "" + page)
    const response = await axios.get(url.href, { responseType: "arraybuffer" })
    const res_data = response.data
    return res_data 
}

export async function loadPageJsdom(page:number):Promise<any> {
    const binary_html_content:Buffer = await loadPage(page)
    const decoded_html_content = iconv.decode(binary_html_content, "euckr")
    const jsdom = new JSDOM(decoded_html_content)
    return jsdom
}

export async function getPageData(page:number) {
    const jsdom:JSDOM = await loadPageJsdom(page)
    const scraped_data = scrapePostData(jsdom)
    return scraped_data
}

export async function _getLastPage(start_page:number=0):Promise<any> {
    let inc_page_flag = true
    let power = 0
    let output:any = { start_page }
    while(true) {
        const page = start_page + 2 ** power
        // console.log(`Make request for page ${page}`)
        const data = await getPageData(page)
        // console.log(page, power, data.length)

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

export async function getLastPage():Promise<number> {
    let power = -1
    let output:any = null
    let count = 0
    while(true) {
        output = await _getLastPage(output == null ? 0 : output.last_non_zero_page)
        count += output.first_zero_power + 1
        // console.log(output)
        if(output.first_zero_power == 0) break
        power = output.last_non_zero_power
    }
    return output.start_page
}

class MyGetLastPage extends GetLastPageBase {
    async getEntryCount(page: number): Promise<number> {
        const data = await getPageData(page)
        return data.length
    }
}

async function main() {
    const inst = new MyGetLastPage()
    console.log(await inst.start())
    console.log("던파게시판")
}
// main()