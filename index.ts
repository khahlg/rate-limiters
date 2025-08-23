import { config } from 'dotenv';
config();

import { logger } from '@configs/index.config.js';
import { FixedWindowCounterRateLimiter } from '@rateLimiters/fixedWindowCounter.rateLimiter.js';
import { createRateLimiter } from '@rateLimiters/index.rateLimiter.js';
import { LeakingBucketRateLimiter } from '@rateLimiters/leakingBucket.rateLimiter.js';
import { TokenBucketRateLimiter } from '@rateLimiters/tokenBucket.rateLimiter.js';
import { RateLimiterType } from '@shared/enums/rateLimiter.enum.js';
import express from 'express';

const { SERVICE_NAME, PORT } = process.env;

const expressApp = express();

const [fixedWindowCounterRateLimiter, fixedWindowCounterRateLimiterMiddleware] =
  createRateLimiter({
    getKey: (req) => req.ip!,
    rateLimiterType: RateLimiterType.FIXED_WINDOW_COUNTER,
    rateLimiterArgs: {
      windowThreshold: 5,
      windowTimeInSeconds: 1,
    },
  });

const [leakingBucketRateLimiter, leakingTokenRateLimiterMiddleware] =
  createRateLimiter({
    getKey: (req) => req.ip!,
    rateLimiterType: RateLimiterType.LEAKING_BUCKET,
    rateLimiterArgs: {
      queueCapacity: 10,
      leakingRequestsRate: [2, 2],
    },
  });

const [tokenBucketRateLimiter, tokenBucketRateLimiterMiddleware] =
  createRateLimiter({
    getKey: (req) => req.ip!,
    rateLimiterType: RateLimiterType.TOKEN_BUCKET,
    rateLimiterArgs: {
      capacity: 5,
      refillingRate: [1, 2],
    },
  });

expressApp.get(
  '/fixed-window-counter',
  fixedWindowCounterRateLimiterMiddleware,
  (_, res) => {
    return res
      .status(200)
      .send({
        message: `Hello from ${SERVICE_NAME}, rate limiter used: ${RateLimiterType.FIXED_WINDOW_COUNTER}`,
      });
  },
);

expressApp.get(
  '/leaking-bucket',
  leakingTokenRateLimiterMiddleware,
  (_, res) => {
    return res
      .status(200)
      .send({
        message: `Hello from ${SERVICE_NAME}, rate limiter used: ${RateLimiterType.LEAKING_BUCKET}`,
      });
  },
);

expressApp.get('/sliding-window-counter', (_, res) => {
  return res
    .status(200)
    .send({
      message: `Hello from ${SERVICE_NAME}, rate limiter used: ${RateLimiterType.SLIDING_WINDOW_COUNTER}`,
    });
});

expressApp.get('/sliding-window-log', (_, res) => {
  return res
    .status(200)
    .send({
      message: `Hello from ${SERVICE_NAME}, rate limiter used: ${RateLimiterType.SLIDING_WINDOW_LOG}`,
    });
});

expressApp.get('/token-bucket', tokenBucketRateLimiterMiddleware, (_, res) => {
  return res
    .status(200)
    .send({
      message: `Hello from ${SERVICE_NAME}, rate limiter used: ${RateLimiterType.TOKEN_BUCKET}`,
    });
});

const server = expressApp.listen(PORT, () => {
  logger.info(`Initialized HTTP server, listening at port ${PORT}!`);
});

function shutdown(signal: string) {
  logger.info(`Received signal ${signal}: starting graceful shutdown...`);

  server.close(async (err) => {
    if (err) {
      logger.error('An error occurred while closing server', err);
      process.exit(1);
    }

    if (
      fixedWindowCounterRateLimiter &&
      fixedWindowCounterRateLimiter instanceof FixedWindowCounterRateLimiter
    ) {
      fixedWindowCounterRateLimiter.stopCreatingWindowInterval();
    }

    if (
      leakingBucketRateLimiter &&
      leakingBucketRateLimiter instanceof LeakingBucketRateLimiter
    ) {
      leakingBucketRateLimiter.stopLeakingRequestsInterval();
    }

    if (
      tokenBucketRateLimiter &&
      tokenBucketRateLimiter instanceof TokenBucketRateLimiter
    ) {
      tokenBucketRateLimiter.stopRefillingTokensInterval();
    }

    logger.info('Graceful shutdown complete.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
