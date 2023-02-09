export type Handler<GeneratorValue, TaskResult> = {
    runTask: (task_id:number, value:GeneratorValue) => Promise<TaskResult>
    isRetriableError:(e:Error) => boolean
}

export class PromiseRateLimitedMultitasking<GeneratorValue, TaskResult> {
    finish_main:any

    is_generator_done = false

    task_id = 0
    tasks:{[id:number]:Promise<any>}

    constructor(
        public generator:AsyncGenerator<GeneratorValue>,
        public handler:Handler<GeneratorValue, TaskResult>
    ) {}

    finishMainIfPossible() {
        if(this.is_generator_done && Object.keys(this.tasks).length == 0) {
            this.finish_main()
        }
    }

    async runTask(task_id:number, value:GeneratorValue):Promise<TaskResult> {
        let result:TaskResult
        try {
            result = await this.handler.runTask(task_id, value)
        }
        catch(e) {
            if(this.handler.isRetriableError(e)) {

            }
            else {
                throw e
            }
        }

        const cleanupTask = () => {
            delete this.tasks[task_id]
            this.finishMainIfPossible()
        }
        cleanupTask()

        return result
    }

    async start() {
        const promise = new Promise((res) => {
            this.finish_main = res
        })

        while (true) {
            const gen_result = await this.generator.next()
            if(gen_result.done) {
                this.is_generator_done = true
                break
            }
            const value:GeneratorValue = gen_result.value
            const task_id = this.task_id++
            const task = this.runTask(task_id, value) 
            this.tasks[task_id] = task
        }

        this.finishMainIfPossible()
        await promise
    }
}