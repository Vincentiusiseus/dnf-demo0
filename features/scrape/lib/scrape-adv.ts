//@ts-ignore
import LeakyBucket from "leaky-bucket"

type GeneratorResult<Argument> = { arg: Argument, page: number }

export type Scraper<Argument> = {
    scrape:(id:number, arg:Argument, page:number) => Promise<any>
}

export class ScrapeAdv<Argument> {
    scrape_tasks:{[id:number]:Promise<any>} = {}
    is_done:boolean = false
    is_last_page:boolean = false
    bucket:LeakyBucket

    successful_requests_count = 0
    
    finish_task_res:any = null

    constructor(public argument:Argument, public scraper:Scraper<Argument>) {
        this.bucket = new LeakyBucket({ capacity: 10, interval: 1 })
    }

    * generateArgs():Generator<GeneratorResult<Argument>> {
        let page = 1
        while(true) {
            yield { arg: this.argument, page }

            page++
        }
    }

    async runTask(id:number, gen_result:GeneratorResult<Argument>):Promise<any> {
        await this.scraper.scrape(id, gen_result.arg, gen_result.page)
        delete this.scrape_tasks[id]
        
        console.log(new Date(), Object.keys(this.scrape_tasks).length, gen_result)

        this.successful_requests_count++
        if(this.successful_requests_count >= 10) {
            const cur_capacity = this.bucket.getCapacity()
            const new_capacity = cur_capacity + 1
            console.log(`Incrementing bucket capacity from ${cur_capacity} to ${new_capacity}`)
            this.bucket.setCapacity(new_capacity)
            this.successful_requests_count = 0
        }

        if(this.is_last_page && Object.keys(this.scrape_tasks).length == 0) {
            this.is_done = true
            this.finish_task_res()
        }
    }

    async throttle() {
        let retry_count = 10
        while(true) {
            try {
                await this.bucket.throttle()
                break
            }
            catch(e) {
                await new Promise((res) => setTimeout(() => res(0), 1000))
                retry_count--
                console.log(`Throttling. Retry count ${retry_count}`)
                if(retry_count <= 0) {
                    throw e
                }
            }
        }
    }

    async start() {
        const promise = new Promise((res) => {
            this.finish_task_res = res
        })

        let id = 0
        const generator = this.generateArgs()
        while(true) {
            const gen_result = generator.next()
            if(gen_result.done) break
            const arg:GeneratorResult<Argument> = gen_result.value

            await this.throttle()
            // if(id >= 5) break
            this.scrape_tasks[id] = this.runTask(id, arg)
            id++
        }

        await promise
    }
}