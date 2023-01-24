import winston from "winston"

export const main_logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.splat(),
                winston.format.printf(({ timestamp, message, worker_id, ...meta }) => {
                    const main_context = worker_id == undefined ? "Main" : `Main:${worker_id}`
                    return `[${timestamp}][${main_context}] ${message}`
                })
        )
})
    ]
})

export const thread_logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.splat(),
                winston.format.printf(({ timestamp, worker_id, message, level, ...meta }) => `[${timestamp}][${worker_id}] ${message} ${JSON.stringify(meta)}`)
            )
        })
    ]
})