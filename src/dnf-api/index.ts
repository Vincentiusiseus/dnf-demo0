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

    _baseRequestCharacter(server_id:string, character_id:string, path:string) {
        /**
         * 2023-01-17 16:10
         * 이 URL이 기준이고 뒤에 더 붙을것이기 때문에 `/`로 끝남
         */
        const url = this._makeUrl(`./servers/${server_id}/characters/${character_id}/`)
        const new_pathname = new URL(path, url.href).pathname
        url.pathname = new_pathname
        return url
    }

    /**
     * 2023-01-17 17:29
     * 던파 공홈 "캐릭터 검색 > 타임라인"에서 나오는 데이터 응답. "언제 로그인"등은 없고
     * 아이템 획득, 상급던전 클리어 등으로 마지막으로 게임 플레이 한 날을 알수 있음
     * 
     * 기본 날짜 범위를 벗어날시 `next` 키에 값은 `null`. 이럴경우 날짜범위필요.
     * endDate는 startDate로 부터 90일 이내 (API Doc 참고)
     * @param server_id 
     * @param character_id 
     * @returns 
     */
    async getCharacterTimeline(server_id:string, character_id:string) {
        const url = this._makeUrl(`./servers/${server_id}/characters/${character_id}/timeline`)
        const response = await axios.get(url.href)
        return response.data
    }

    /**
     * 2023-01-17 15:41
     * 명성치, 스탯 등
     * 
     * @param server_id 
     * @param character_id 
     * @returns 
     */
    async getCharacterStatus(server_id:string, character_id:string) {
        const url = this._makeUrl(`./servers/${server_id}/characters/${character_id}/status`)
        const response = await axios.get(url.href)
        return response.data
    }

    async getCharacterEquipment(server_id:string, character_id:string) {
        const url = this._baseRequestCharacter(server_id, character_id, "./equip/equipment")
        const response = await axios.get(url.href)
        return response.data
    }

    async getCharacterAvatar(server_id:string, character_id:string) {
        const url = this._baseRequestCharacter(server_id, character_id, "./equip/avatar")
        const response = await axios.get(url.href)
        return response.data
    }

    async getCharacterCreature(server_id:string, character_id:string) {
        const url = this._baseRequestCharacter(server_id, character_id, "./equip/creature")
        const response = await axios.get(url.href)
        return response.data
    }

    async getCharacterFlag(server_id:string, character_id:string) {
        const url = this._baseRequestCharacter(server_id, character_id, "./equip/flag")
        const response = await axios.get(url.href)
        return response.data
    }

    async getCharacterTalisman(server_id:string, character_id:string) {
        const url = this._baseRequestCharacter(server_id, character_id, "./equip/talisman")
        const response = await axios.get(url.href)
        return response.data
    }

    async getCharacterSkillStyle(server_id:string, character_id:string) {
        const url = this._baseRequestCharacter(server_id, character_id, "./skill/style")
        const response = await axios.get(url.href)
        return response.data
    }

    async getCharacterSkillBuffEquipment(server_id:string, character_id:string) {
        const url = this._baseRequestCharacter(server_id, character_id, "./skill/buff/equip/equipment")
        const response = await axios.get(url.href)
        return response.data
    }

    async getCharacterSkillBuffAvatar(server_id:string, character_id:string) {
        const url = this._baseRequestCharacter(server_id, character_id, "./skill/buff/equip/avatar")
        const response = await axios.get(url.href)
        return response.data
    }

    async getCharacterSkillBuffCreature(server_id:string, character_id:string) {
        const url = this._baseRequestCharacter(server_id, character_id, "./skill/buff/equip/creature")
        const response = await axios.get(url.href)
        return response.data
    }
}

async function main() {
    const api_key = fs.readFileSync("./cred/api.txt", "utf-8").trim()
    const inst = new DnfApi(api_key)
    let data:any = null
    try {
        const methods = [
            "getCharacterTimeline",
            // "getCharacterStatus",
            // "getCharacterEquipment",
            // "getCharacterAvatar",
            // "getCharacterCreature",
            // "getCharacterFlag",
            // "getCharacterTalisman",
            // "getCharacterSkillStyle",
            // "getCharacterSkillBuffEquipment",
            // "getCharacterSkillBuffAvatar",
            // "getCharacterSkillBuffCreature"
        ]
        for(const method of methods) {
            //@ts-ignore
            const data = await inst[method]("diregie", "ef6d916d16da1154ec59ef0b9fa548cf")
            console.log(data, method)
            if(method == "getCharacterTimeline") {
                console.log(data.timeline.rows)
            }
        }
        // data = await inst.getDfJobs()
    }
    catch(e) {
        if("response" in e) {
            console.log(e.response.data)
            console.log(e.response)
        }
        else throw e
    }
}
main()