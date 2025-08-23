import {
  ExpressRequestContext,
  RateLimiter,
} from '@shared/interfaces/rateLimter.interface.js';

interface SlidingWindowLogRateLimiterConstructorArgs {}

class SlidingWindowLogRateLimiter implements RateLimiter {
  constructor(args: SlidingWindowLogRateLimiterConstructorArgs) {}

  allowRequest(): boolean {
    return true;
  }

  setHeaders({
    expressRequestContext,
  }: {
    expressRequestContext: ExpressRequestContext;
  }): void {
    const { res } = expressRequestContext;

    res.setHeader('X-Ratelimit-Remaining', 0);
    res.setHeader('X-Ratelimit-Limit', 0);
    res.setHeader('X-Ratelimit-Retry-After', 0);
  }
}

export type { SlidingWindowLogRateLimiterConstructorArgs };

export { SlidingWindowLogRateLimiter };
