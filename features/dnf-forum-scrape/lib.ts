import type { JSDOM } from "jsdom"

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