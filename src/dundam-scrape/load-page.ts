// Node libs
import * as crypto from "crypto"
import * as https from "https"

// NPM libs
import axios, { AxiosResponse } from "axios"
import { JSDOM } from "jsdom"
import iconv from "iconv-lite"

const BASE_URL = `https://dundam.xyz/damage_ranking?type=7&weaponType=전체&weaponDetail=전체`
export async function loadPage(page:number, base_job:string, job:string):Promise<Buffer> {
    const url = new URL("", BASE_URL)
    url.searchParams.append("page", "" + page)
    url.searchParams.append("job", job)
    url.searchParams.append("baseJob", base_job)

    console.log(url.href)
    const response = await axios.get(url.href)
    const res_data = response.data
    return res_data 
}

export async function loadPageJsdom(page:number, base_job:string, job:string):Promise<JSDOM> {
    const html_content = await loadPage(page, base_job, job)
    const jsdom = new JSDOM(html_content)
    return jsdom
}

async function main() {
    const jsdom = await loadPageJsdom(1, "귀검사(여)", "眞 소드마스터")
    const document = jsdom.window.document
    // const table = document.querySelector(".rk-table")
    // const t_body = table.querySelector(".rkt-tbody")
    // const rows = t_body.querySelectorAll(".rkt-tr")
    const rows = document.querySelectorAll(".rkt-tr")
    console.log(rows.length)
    rows.forEach(el => console.log(el.outerHTML))
}

async function requestData(page:number, base_job:string, job:string) {
    const BASE_URL = `https://dundam.xyz/dat/dealerRankingData.jsp?type=7&weaponType=전체&weaponDetail=전체`
    const url = new URL("", BASE_URL)
    url.searchParams.append("page", "" + page)
    url.searchParams.append("job", job)
    url.searchParams.append("baseJob", base_job)

    const response = await axios.post(url.href)
    const res_data = response.data
    return res_data 
}

async function main1() {
    const data = await requestData(1, "귀검사(여)", "眞 소드마스터")
    console.log(data)
}
main1()