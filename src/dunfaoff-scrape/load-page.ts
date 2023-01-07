// Node libs
import * as qs from "querystring"

// NPM libs
import axios from "axios"

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
    gender: "M" | "F"
}

/**
 * @param {*} payload 
 * @param {*} page 
 * @param {*} isHoly `true` when the job is not a buffer throws error. `false` works however.
 */
export async function makeRequest(payload:Payload, page=1) {
  const url = "https://dunfaoff.com/ranking.df"
  const data = {
    ...payload,
    nickName: "",
    filter: "{}", // An empty filter need to be a string "{}" else throws error.
    page
  }
  
  console.log(`Payload: ${JSON.stringify(data)}`)

  const data_encoded = qs.stringify(data)
  const res  = await axios.post(url, data_encoded)
  return res.data
}