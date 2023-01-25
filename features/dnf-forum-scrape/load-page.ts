// Node libs
import * as crypto from "crypto"
import * as https from "https"

// NPM libs
import _axios, { AxiosResponse } from "axios"
import { JSDOM } from "jsdom"
import iconv from "iconv-lite"

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