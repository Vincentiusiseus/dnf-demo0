import axios from "axios"

export async function requestDealerData(page:number, base_job:string, job:string) {
    const BASE_URL = `https://dundam.xyz/dat/dealerRankingData.jsp?type=7&weaponType=전체&weaponDetail=전체`
    const url = new URL("", BASE_URL)
    url.searchParams.append("page", "" + page)
    url.searchParams.append("job", job)
    url.searchParams.append("baseJob", base_job)

    const response = await axios.post(url.href)
    const res_data = response.data
    return res_data 
}

const CLASS_NAME_TO_BUFFER_INDEX = {
    "프리스트(여)": 2,
    "프리스트(남)": 3,
    "마법사(여)": 4
}

export async function requestBufferData(page:number, class_name:string) {
    const BASE_URL = `https://dundam.xyz/dat/bufferRankingData.jsp?type=1&favor=2`
    const url = new URL("", BASE_URL)
    url.searchParams.append("page", "" + page)
    //@ts-ignore
    const job_index = CLASS_NAME_TO_BUFFER_INDEX[class_name]
    url.searchParams.append("job", "" + job_index)

    const response = await axios.post(url.href)
    const res_data = response.data
    return res_data 
}