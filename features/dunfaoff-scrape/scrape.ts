// NPM libs
import { JSDOM } from "jsdom"

export type PageCharData = {
    character_id:string,
    server:string,
    nick_name:string,
    rating:number
}

export async function scrapeCharData(html_content:string):Promise<PageCharData[]> {
    const jsdom = new JSDOM(html_content)
    const document = jsdom.window.document
    const anchor_span_elements = document.querySelectorAll("table.table-default td span.server")

    const output:PageCharData[] = []

    anchor_span_elements.forEach((anchor_span_element) => {
        const anchor_tr_element = anchor_span_element.closest("tr")

        /**
         * 2022-04-23 20:29
         * Apparently, the page I get doesn't have textContent for span.server. Looks like it's rendered from
         * `tr` element's `data-server`... LOL
         */
        // const server = anchor_span_element.textContent
        const character_id = anchor_tr_element.getAttribute("data-characterid")
        const server = anchor_tr_element.getAttribute("data-server")
        const nick_name = anchor_tr_element.querySelector("td b").textContent
        const rating = parseInt(anchor_tr_element.querySelector("td.text-right b").textContent.replaceAll(",",""))

        const entry = { character_id, server, nick_name, rating }
        output.push(entry)
    })
    return output
}