import { RateLimiter } from '@shared/interfaces/rateLimter.interface.js';

interface LeakingBucketRateLimiterConstructorArgs {}

class LeakingBucketRateLimiter implements RateLimiter {
  constructor(args: LeakingBucketRateLimiterConstructorArgs) {}

  allowRequest(): boolean {
    return true;
  }
}

export type { LeakingBucketRateLimiterConstructorArgs };

export { LeakingBucketRateLimiter };
