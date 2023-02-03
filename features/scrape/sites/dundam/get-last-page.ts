// NPM libs
import { AxiosError } from "axios"

// My libs
import { GetLastPageBase } from "~/src/get-last-page"
import { requestDealerData, requestBufferData } from "~/features/dundam-scrape/load-page"

class MyGetLastPage extends GetLastPageBase {
    constructor(
        public class_name:string,
        public neo_awk_name:string,
        public is_buffer:boolean=false
    ) { super() }

    async getEntryCount(page: number): Promise<number> {
        let res_data:any
        if(this.is_buffer == false) {
            res_data = await requestDealerData(page, this.class_name, this.neo_awk_name)
        }
        else {
            let job_index:number
            if(this.class_name == "all" && this.neo_awk_name == "all") job_index = 1
            else if(this.class_name == "프리스트(여)" && this.neo_awk_name == "眞 크루세이더") job_index = 2
            else if(this.class_name == "프리스트(남)" && this.neo_awk_name == "眞 크루세이더") job_index = 3
            else if(this.class_name == "마법사(여)" && this.neo_awk_name == "眞 인챈트리스") job_index = 4
            try {
                res_data = await requestBufferData(page, job_index)
            }
            catch(e) {
                if(e instanceof AxiosError && e.response.status == 500) {
                    res_data = { ranking: [] }
                }
                else {
                    throw e
                }
            }
        }
        const data = res_data.ranking
        return data.length
    }
}

export async function getLastPage(class_name:string, neo_awk_name:string, is_buffer:boolean=false) {
    const inst = new MyGetLastPage(class_name, neo_awk_name, is_buffer)
    const page_total = await inst.start()
    return page_total
}