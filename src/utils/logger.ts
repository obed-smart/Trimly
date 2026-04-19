import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: isProduction ? 'info' : 'debug',

  base: {
    service: 'Trimly_Api',
    env: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: false,
            translateTime: 'HH:MM:ss Z',
          },
        },
      }),
  serializers: {
    err: isProduction
      ? (err) => ({
          type: err.type,
          message: err.message,
          statusCode: err.statusCode,
        })
      : pino.stdSerializers.err,
  },
});

export default logger;
