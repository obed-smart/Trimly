import basicAuth from 'express-basic-auth';

export const metricsAuth = basicAuth({
  users: {
    [process.env.METRICS_USER!]: process.env.METRICS_PASSWORD!,
  },
  challenge: true,
  unauthorizedResponse: 'Unauthorized',
});
