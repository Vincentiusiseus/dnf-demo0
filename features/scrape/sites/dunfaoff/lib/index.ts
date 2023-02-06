// Node libs
import * as qs from "querystring"

// NPM libs
import axios, { AxiosResponse } from "axios"
import { JSDOM } from "jsdom"

// fs.writeFileSync = () => {
//   // console.log("fs.writeFileSync mock")
// }
// axios.post = () => {
//   // console.log("axios post mock")
//   return { data: "mock" }
// }

// Types
export type Payload = {
    jobName: string
    jobGrowName: string
    isHoly: boolean
    gender: "M" | "F" | ""
}

/**
 * @param {*} payload 
 * @param {*} page 
 * @param {*} isHoly `true` when the job is not a buffer throws error. `false` works however.
 */
export async function makeRequest(payload:Payload, page=1):Promise<AxiosResponse> {
  const url = "https://dunfaoff.com/ranking.df"
  const data = {
    ...payload,
    nickName: "",
    filter: "{}", // An empty filter need to be a string "{}" else throws error.
    page
  }
  
  const data_encoded = qs.stringify(data)
  let res:AxiosResponse
  try {
    res  = await axios.post(url, data_encoded)
  }
  catch(e) {
    // console.log(e.response)
    console.log(e.response.status)
    throw e
  }
  return res
}


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

export async function scrapePage(payload:Payload, page:number) {
    const response = await makeRequest(payload, page)
    const html_content = response.data
    const char_data = await scrapeCharData(html_content)
    return char_data
}