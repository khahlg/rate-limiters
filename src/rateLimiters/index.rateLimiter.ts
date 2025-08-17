import { RateLimiterType } from '@shared/enums/rateLimiter.enum.js';
import { NextFunction, Request, Response } from 'express';
import {
  FixedWindowCounterRateLimiter,
  FixedWindowCounterRateLimiterConstructorArgs,
} from './fixedWindowCounter.rateLimiter.js';
import {
  LeakingBucketRateLimiter,
  LeakingBucketRateLimiterConstructorArgs,
} from './leakingBucket.rateLimiter.js';
import {
  SlidingWindowCounterRateLimiter,
  SlidingWindowCounterRateLimiterConstructorArgs,
} from './slidingWindowCounter.rateLimiter.js';
import {
  SlidingWindowLogRateLimiter,
  SlidingWindowLogRateLimiterConstructorArgs,
} from './slidingWindowLog.rateLimiter.js';
import {
  TokenBucketRateLimiter,
  TokenBucketRateLimiterConstructorArgs,
} from './tokenBucket.rateLimiter.js';

class RateLimiterFactory {
  static create({
    type,
    args,
  }: {
    type: RateLimiterType;
    args:
      | FixedWindowCounterRateLimiterConstructorArgs
      | LeakingBucketRateLimiterConstructorArgs
      | SlidingWindowCounterRateLimiterConstructorArgs
      | SlidingWindowLogRateLimiterConstructorArgs
      | TokenBucketRateLimiterConstructorArgs;
  }) {
    switch (type) {
      case RateLimiterType.FIXED_WINDOW_COUNTER:
      case RateLimiterType.LEAKING_BUCKET:
      case RateLimiterType.SLIDING_WINDOW_COUNTER:
      case RateLimiterType.SLIDING_WINDOW_LOG:
        return null;
      case RateLimiterType.TOKEN_BUCKET:
        return new TokenBucketRateLimiter(
          args as TokenBucketRateLimiterConstructorArgs,
        );
      default:
        return null;
    }
  }
}

const rateLimiterMap = new Map<
  string,
  | null
  | FixedWindowCounterRateLimiter
  | LeakingBucketRateLimiter
  | SlidingWindowCounterRateLimiter
  | SlidingWindowLogRateLimiter
  | TokenBucketRateLimiter
>();

const createRateLimiter = ({
  getKey,
  rateLimiterType,
  rateLimiterArgs,
}: {
  getKey: (req: Request) => string;
  rateLimiterType: RateLimiterType;
  rateLimiterArgs:
    | FixedWindowCounterRateLimiterConstructorArgs
    | LeakingBucketRateLimiterConstructorArgs
    | SlidingWindowCounterRateLimiterConstructorArgs
    | SlidingWindowLogRateLimiterConstructorArgs
    | TokenBucketRateLimiterConstructorArgs;
}) => {
  const rateLimiterMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const key = getKey(req);
    let rateLimiter = rateLimiterMap.get(key);

    if (!rateLimiter) {
      rateLimiter = RateLimiterFactory.create({
        type: rateLimiterType,
        args: rateLimiterArgs,
      });

      if (!rateLimiter) {
        return next();
      }

      rateLimiterMap.set(key, rateLimiter);
    }

    if (!rateLimiter.allowRequest()) {
      return res.status(429).json({ message: 'Too many requests.' });
    }

    return next();
  };

  return rateLimiterMiddleware;
};

export { createRateLimiter };
