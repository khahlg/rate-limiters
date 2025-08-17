import { RateLimiter } from '@shared/interfaces/rateLimter.interface.js';

interface SlidingWindowLogRateLimiterConstructorArgs {}

class SlidingWindowLogRateLimiter implements RateLimiter {
  constructor(args: SlidingWindowLogRateLimiterConstructorArgs) {}

  allowRequest(): boolean {
    return true;
  }
}

export type { SlidingWindowLogRateLimiterConstructorArgs };

export { SlidingWindowLogRateLimiter };
