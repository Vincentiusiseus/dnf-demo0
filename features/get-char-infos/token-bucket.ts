export class TokenBucket {
    bucket:number
    last_check:Date
    rate_ms:number

    constructor(public max_tokens:number, public max_time_s:number) {
        this.rate_ms = this.max_tokens / (this.max_time_s * 1000)
        this.bucket = this.max_tokens
        this.last_check = new Date()
    }

    updateBucket() {
        const now = new Date()
        const time_passed_ms = now.getTime() - this.last_check.getTime()
        this.last_check = new Date()

        this.bucket = this.bucket + time_passed_ms * this.rate_ms
        if(this.bucket > this.max_tokens) this.bucket = this.max_tokens
        if(this.bucket > 0) this.bucket--

        console.log(`After bucket update:`, this.bucket)

        return this.bucket
    }
}