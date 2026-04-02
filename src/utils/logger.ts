import pino from "pino";


const isProduction = process.env.NODE_ENV === "production";



const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  base: {
    service: "Trimly_Api",
    env: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            singleLine: false,
            translateTime: "HH:MM:ss Z",
          },
        },
      }),
});

export default logger;
