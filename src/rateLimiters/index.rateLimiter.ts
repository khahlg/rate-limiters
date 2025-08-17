import { RateLimiterType } from '@shared/enums/rateLimiter.enum.js';
import type { RateLimiter, RateLimiterConstructorArgs } from '@shared/types/rateLimiter.type.js';
import { NextFunction, Request, Response } from 'express';
import { LeakingBucketRateLimiter, LeakingBucketRateLimiterConstructorArgs } from './leakingBucket.rateLimiter.js';
import { TokenBucketRateLimiter, TokenBucketRateLimiterConstructorArgs } from './tokenBucket.rateLimiter.js';

class RateLimiterFactory {
  static create({ type, args }: { type: RateLimiterType; args: RateLimiterConstructorArgs }): null | RateLimiter {
    switch (type) {
      case RateLimiterType.FIXED_WINDOW_COUNTER:
        return null;
      case RateLimiterType.LEAKING_BUCKET:
        return new LeakingBucketRateLimiter(args as LeakingBucketRateLimiterConstructorArgs);
      case RateLimiterType.SLIDING_WINDOW_COUNTER:
      case RateLimiterType.SLIDING_WINDOW_LOG:
        return null;
      case RateLimiterType.TOKEN_BUCKET:
        return new TokenBucketRateLimiter(args as TokenBucketRateLimiterConstructorArgs);
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
  rateLimiterMiddleware: (req: Request, res: Response, next: NextFunction) => void,
] => {
  let rateLimiter: undefined | null | RateLimiter;

  const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
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

    if (!rateLimiter.allowRequest({ expressRequestContext: { req, res, next } })) {
      return res.status(429).json({ message: 'Too many requests.' });
    }

    return next();
  };

  return [rateLimiter, rateLimiterMiddleware];
};

export { createRateLimiter };
