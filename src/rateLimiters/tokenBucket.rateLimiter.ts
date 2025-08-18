import { logger } from '@configs/index.config.js';
import type { RateLimiter } from '@shared/interfaces/rateLimter.interface.js';

interface TokenBucketRateLimiterConstructorArgs {
  capacity: number;
  refillingRate: number[];
}

class TokenBucketRateLimiter implements RateLimiter {
  // The maximum number of tokens in bucket.
  private readonly capacity: number;
  // Refilling rate, an array of two values.
  // The first value is the number of tokens that should be added to the bucket after a certain amount of time, which is the second value.
  // The second value is the interval after which a specifid number of tokens that should be added to the bucket.
  private readonly refillingRate: number[];
  // The number of tokens in bucket.
  private numberOfTokens: number;
  private refillIntervalId: null | NodeJS.Timeout;

  constructor(args: TokenBucketRateLimiterConstructorArgs) {
    this.capacity = args.capacity;
    this.refillingRate = args.refillingRate;
    this.numberOfTokens = args.capacity;
    this.refillIntervalId = null;

    this.startRefillingTokensInterval();
  }

  startRefillingTokensInterval(): void {
    if (this.refillIntervalId) return;

    this.refillIntervalId = setInterval(() => {
      if (this.numberOfTokens !== this.capacity) {
        this.numberOfTokens = Math.min(this.capacity, this.numberOfTokens + this.refillingRate[0]);
        logger.info(
          `Added ${this.refillingRate[0]} ${this.refillingRate[0] > 1 ? 'tokens' : 'token'} to bucket, current number of tokens in bucket is ${this.numberOfTokens}`,
        );
      }
    }, this.refillingRate[1] * 1000);
  }

  stopRefillingTokensInterval(): void {
    if (this.refillIntervalId) {
      clearInterval(this.refillIntervalId);
      this.refillIntervalId = null;
    }
  }

  consumeToken(): boolean {
    if (this.numberOfTokens > 0) {
      this.numberOfTokens -= 1;
      logger.info(`Consumed 1 token from bucket, number of tokens left in bucket is ${this.numberOfTokens}`);

      return true;
    }

    logger.error('No token left in bucket, request will be throttled.');
    return false;
  }

  allowRequest(): boolean {
    return this.consumeToken();
  }
}

export type { TokenBucketRateLimiterConstructorArgs };

export { TokenBucketRateLimiter };
