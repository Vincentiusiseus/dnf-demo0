// Node libs
import * as https from "https"
import * as crypto from 'crypto'
import * as fs from "fs"

// NPM libs
import _axios from 'axios'

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

export class DnfApi {
    api_key:string

    static BASE_URL = `https://api.neople.co.kr/df/`

    constructor(api_key:string) {
        this.api_key = api_key
    }

    _makeUrl(path:string) {
        const url = new URL(path, DnfApi.BASE_URL)
        url.searchParams.set("apikey", this.api_key)
        return url
    }
    
    /**
     * 2022-12-31 17:08
     * Fixed output.
     */
    async getServerIds() {
        const url = this._makeUrl("./servers")
        const response = await axios.get(url.href)
        return response.data
    }

    /**
     * 
     * @param server_id `all` 가능
     * @param name 
     * @returns 
     */
    async getCharacter(server_id:string, name:string) {
        const url = this._makeUrl(`./servers/${server_id}/characters`)
        url.searchParams.append("characterName", name)
        const response = await axios.get(url.href)
        /**
         * 2023-01-11 18:16
         * headers에 사용량 관련 정보 없음 ㅠㅠ
         */
        return response.data
    }

    async getCharacterInfo(server_id:string, id:string) {
        const url = this._makeUrl(`./servers/${server_id}/characters/${id}`)
        const response = await axios.get(url.href)
        return response.data
    }

    async getDfJobs() {
        const url = this._makeUrl(`./jobs/`)
        const response = await axios.get(url.href)
        return response.data
    }
}

async function main() {
    const api_key = fs.readFileSync("./cred/api.txt", "utf-8").trim()
    const inst = new DnfApi(api_key)
    let data:any = null
    try {
        // data = await inst.getCharacter("all", "이창에흑염룡")
        data = await inst.getDfJobs()
    }
    catch(e) {
        console.log(e.response.data)
        console.log(e.response)
        // throw e
    }
    console.dir(data, { depth: 10 })
}
// main()