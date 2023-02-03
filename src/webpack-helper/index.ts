import * as path from 'path'

// NPM libs
import webpack from "webpack"

// My libs
import { makeConfig } from "./makeConfig"

export function packAndRun(dir_name:string, file_name:string) {
    const config = makeConfig(dir_name, file_name)
    
    webpack(
        config,
        (err, stats) => {
            if(err) {
                console.log(err)
                return
            }

            const info = stats.toJson()
            // console.log(info)
            
            const main_fp = path.join(dir_name, "./dist/main.js")
            // console.log(main_fp)
            require(main_fp)
        }
    )
}

function main() {
    const target = process.argv[2]
    const file_name = process.argv[3]
    const dir_name = path.join(__dirname, "../..", target)
    packAndRun(dir_name, file_name)
}
main()