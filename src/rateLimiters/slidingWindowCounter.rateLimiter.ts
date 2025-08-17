import { RateLimiter } from '@shared/interfaces/rateLimter.interface.js';

interface SlidingWindowCounterRateLimiterConstructorArgs {}

class SlidingWindowCounterRateLimiter implements RateLimiter {
  constructor(args: SlidingWindowCounterRateLimiterConstructorArgs) {}

  allowRequest(): boolean {
    return true;
  }
}

export type { SlidingWindowCounterRateLimiterConstructorArgs };

export { SlidingWindowCounterRateLimiter };
