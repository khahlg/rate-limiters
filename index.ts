import { config } from 'dotenv';
config();

import { logger } from '@configs/index.config.js';
import { createRateLimiter } from '@rateLimiters/index.rateLimiter.js';
import { RateLimiterType } from '@shared/enums/rateLimiter.enum.js';
import express from 'express';

const { SERVICE_NAME, PORT } = process.env;

const expressApp = express();

const rateLimiter = createRateLimiter({
  getKey: (req) => req.ip!,
  rateLimiterType: RateLimiterType.TOKEN_BUCKET,
  rateLimiterArgs: {
    capacity: 5,
    consumeAmount: 1,
    refillAmount: 1,
    refillIntervalInSeconds: 2,
  },
});

expressApp.use(rateLimiter);

expressApp.get('/', (_, res) => {
  return res.status(200).send({ message: `Hello from ${SERVICE_NAME}` });
});

expressApp.listen(PORT, () => {
  logger.info(
    `Initialized HTTP server, HTTP server is listening at port ${PORT}!`,
  );
});
