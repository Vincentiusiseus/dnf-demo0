// Node libs
import * as fs from "fs"
import * as path from "path"

// My libs
import { DfApi } from "../df-api"

async function main() {
    /**
     * 2023-01-25 21:00
     * Using `res` instead of `data` because we are saving its exact response data that has `rows` key.
     */
    const target_fp = path.join(__dirname, "../data/jobs-res.json")
    if(fs.existsSync(target_fp)) {
        console.log(`File already exists at ${target_fp}. Rename or remove it to continue.`)
        return        
    }
    else {
        console.log(`File will be created at ${target_fp}.`)
    }

    const api_key = fs.readFileSync("./cred/api.txt", "utf8")
    const df_api = new DfApi(api_key)
    const res_data =  await df_api.getDfJobs()
    fs.writeFileSync(target_fp, JSON.stringify(res_data, null, 2))

    console.log(`Finished updating df-jobs data`)
}
main()