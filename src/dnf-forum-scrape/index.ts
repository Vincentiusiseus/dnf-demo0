// NPM libs
import { JSDOM } from "jsdom"
import _axios, { AxiosResponse } from "axios"
import iconv from "iconv-lite"

// NPM Types
import type { Db } from "mongodb"

// Node libs
import * as fs from "fs"
import * as crypto from "crypto"
import * as https from "https"

// My libs
import { client } from "~/src/db"

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

class Main {
    static BASE_URL = `https://df.nexon.com/df/community/dnfboard?mode=list&order=reg_date&order_type=DESC`

    db:Db
    page:number
    stop_flag:boolean
    
    constructor() {
        this.page = 0
        // this.page = 33823
        this.stop_flag = false
    }

    async loadPage() {
        const url = new URL("", Main.BASE_URL)
        url.searchParams.append("page", "" + this.page)
        const response = await axios.get(url.href, { responseType: "arraybuffer" })
        const html_content = response.data
        return html_content
    }

    async scrapePosts() {
        const html_content:Buffer = await this.loadPage()
        const decoded_html_content = iconv.decode(html_content, "euckr")
        const jsdom = new JSDOM(decoded_html_content)
        const document = jsdom.window.document
        const post_row_elements = document.querySelectorAll("table.tbl tr:not(.ntc)")
        let post_row_array = Array.from(post_row_elements)
        post_row_array = post_row_array.filter(row => row.querySelector("th") == null && row.querySelector("td.author") != null)

        if(post_row_array.length == 0) {
            this.stop_flag = true
            console.log(`Stop flag at page ${this.page}`)
            return
        }

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

    async start() {
        const start_dt = new Date()

        console.log("Start")
        await client.connect()
        this.db = client.db("dnf-data")

        while(true) {
            console.log(`Load page ${this.page}`)
            await this.loadPage()
            const output = await this.scrapePosts()
            if(output != null && output.length > 0) {
                console.log(`Insert ${output.length} entries.`)
                await this.db.collection("forum-users").insertMany(output)
            }
            console.log(`Done for page ${this.page}. Took ${new Date().getTime() - start_dt.getTime()}ms so far.`)

            if(this.stop_flag) break;

            const end_dt = new Date()
            const time_took_ms = end_dt.getTime() - start_dt.getTime()
            const time_took_s = time_took_ms / 1000
            /**
             * 2022-01-02 08:37
             * 테스트 해봤을때 100페이지 넘어갈때까지 올라가다가 4 페이지/s 안넘어감
             */
            const pages_per_s = this.page / time_took_s
            console.log(`Pages per second: ${pages_per_s}`)

            this.page++
        } 
        console.log(`Done`)
        await client.close()
        // fs.writeFileSync("./data/html_content.html", html_content)

        const end_dt = new Date()
        const time_took_ms = end_dt.getTime() - start_dt.getTime()
        console.log(`Took ${time_took_ms}ms`)
    }
}

async function main() {
    await new Main().start()
}
main()