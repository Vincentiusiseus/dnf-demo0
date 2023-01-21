import winston from "winston"

export const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json(),
        winston.format.simple()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});


logger.info({
   message: "hi",
   datetime: new Date()
})
logger.error({
   message: "custum error",
   datetime: new Date()
})

const childLogger = logger.child({ requestId: '451' });

childLogger.info("What will be printed?", { private: true })