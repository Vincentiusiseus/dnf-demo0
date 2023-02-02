// Node libs
import * as fs from "fs"

// My libs
import { DfApi } from "../df-api"

async function main() {
    const api_key = fs.readFileSync("./cred/api.txt", "utf-8").trim()
    const inst = new DfApi(api_key)
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
// main()

async function main1() {
    const api_key = fs.readFileSync("./cred/api.txt", "utf-8").trim()
    const inst = new DfApi(api_key)
    const response = await inst.getCharacterInfo("anton", "a2020b9a7d048b6b07f6cd86fce5a5c4")
    
    console.log(response)
}
main1()