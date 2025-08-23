import {
  ExpressRequestContext,
  RateLimiter,
} from '@shared/interfaces/rateLimter.interface.js';

interface SlidingWindowCounterRateLimiterConstructorArgs {}

class SlidingWindowCounterRateLimiter implements RateLimiter {
  constructor(args: SlidingWindowCounterRateLimiterConstructorArgs) {}

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

export type { SlidingWindowCounterRateLimiterConstructorArgs };

export { SlidingWindowCounterRateLimiter };
