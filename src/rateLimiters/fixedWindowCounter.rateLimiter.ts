import { RateLimiter } from '@shared/interfaces/rateLimter.interface.js';

interface FixedWindowCounterRateLimiterConstructorArgs {}

class FixedWindowCounterRateLimiter implements RateLimiter {
  constructor(args: FixedWindowCounterRateLimiterConstructorArgs) {}

  allowRequest(): boolean {
    return true;
  }
}

export type { FixedWindowCounterRateLimiterConstructorArgs };

export { FixedWindowCounterRateLimiter };
