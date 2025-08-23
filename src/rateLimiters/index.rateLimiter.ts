import { RateLimiterType } from '@shared/enums/rateLimiter.enum.js';
import { ExpressRequestContext } from '@shared/interfaces/rateLimter.interface.js';
import type {
  RateLimiter,
  RateLimiterConstructorArgs,
} from '@shared/types/rateLimiter.type.js';
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
    args: RateLimiterConstructorArgs;
  }): null | RateLimiter {
    switch (type) {
      case RateLimiterType.FIXED_WINDOW_COUNTER:
        return new FixedWindowCounterRateLimiter(
          args as FixedWindowCounterRateLimiterConstructorArgs,
        );
      case RateLimiterType.LEAKING_BUCKET:
        return new LeakingBucketRateLimiter(
          args as LeakingBucketRateLimiterConstructorArgs,
        );
      case RateLimiterType.SLIDING_WINDOW_COUNTER:
        return new SlidingWindowCounterRateLimiter(
          args as SlidingWindowCounterRateLimiterConstructorArgs,
        );
      case RateLimiterType.SLIDING_WINDOW_LOG:
        return new SlidingWindowLogRateLimiter(
          args as SlidingWindowLogRateLimiterConstructorArgs,
        );
      case RateLimiterType.TOKEN_BUCKET:
        return new TokenBucketRateLimiter(
          args as TokenBucketRateLimiterConstructorArgs,
        );
      default:
        return null;
    }
  }
}

const map = new Map<string, undefined | null | RateLimiter>();

const createRateLimiter = ({
  getKey,
  rateLimiterType,
  rateLimiterArgs,
}: {
  getKey: (req: Request) => string;
  rateLimiterType: RateLimiterType;
  rateLimiterArgs: RateLimiterConstructorArgs;
}): [
  rateLimiter: undefined | null | RateLimiter,
  rateLimiterMiddleware: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void,
] => {
  let rateLimiter: undefined | null | RateLimiter;

  const rateLimiterMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const key = `${rateLimiterType}_${getKey(req)}`;
    rateLimiter = map.get(key);

    if (!rateLimiter) {
      rateLimiter = RateLimiterFactory.create({
        type: rateLimiterType,
        args: rateLimiterArgs,
      });

      if (!rateLimiter) {
        return next();
      }

      map.set(key, rateLimiter);
    }

    const expressRequestContext: ExpressRequestContext = { req, res, next };

    if (!rateLimiter.allowRequest({ expressRequestContext })) {
      rateLimiter.setHeaders({ expressRequestContext });
      return res.status(429).json({ message: 'Too many requests.' });
    }

    return next();
  };

  return [rateLimiter, rateLimiterMiddleware];
};

export { createRateLimiter };
