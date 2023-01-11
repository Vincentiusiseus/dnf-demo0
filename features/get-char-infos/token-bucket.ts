export class TokenBucket {
    bucket:number
    last_check:Date
    rate_ms:number

    constructor(public max_tokens:number, public max_time_s:number) {
        this.rate_ms = this.max_tokens / (this.max_time_s * 1000)
        this.bucket = this.max_tokens
        this.last_check = new Date()
    }

    next_refresh_dt:Date
    updateBucket1() {
        const now = new Date()
        const old_bucket = this.bucket
        if(this.next_refresh_dt == undefined || now > this.next_refresh_dt) {
            this.next_refresh_dt = new Date(now.getTime() + this.max_time_s * 1000)
            console.log(`[${new Date().toISOString()}] Next refresh DT: ${this.next_refresh_dt.toISOString()}`)
            this.bucket = this.max_tokens
        }

        // this.bucket--

        if(this.bucket < 0) this.bucket = 0

        console.log(`[${now.toISOString()}] After bucket update ${old_bucket} -> ${this.bucket}`)

        return this.bucket
    }

    updateBucket0() {
        const now = new Date()
        const time_passed_ms = now.getTime() - this.last_check.getTime()
        this.last_check = new Date()
        const old_bucket = this.bucket

        const increment = time_passed_ms * this.rate_ms
        console.log(`[${now.toISOString()}] time passed ms - ${time_passed_ms}ms || increment - ${increment}`)
        this.bucket = this.bucket + increment

        // Keep Max
        if(this.bucket > this.max_tokens) {
            console.log(`[${now.toISOString()}] RESET bucket`)
            this.bucket = this.max_tokens
        }

        this.bucket--
        
        // Keep Min
        if(this.bucket < 0) this.bucket = 0

        console.log(`[${now.toISOString()}] After bucket update ${old_bucket} -> ${this.bucket}`)

        return this.bucket
    }

    updateBucket() {
        return this.updateBucket1()
    }
}