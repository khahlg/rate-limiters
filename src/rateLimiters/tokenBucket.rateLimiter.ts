import { logger } from '@configs/index.config.js';
import { RateLimiter } from '@shared/interfaces/rateLimter.interface.js';

interface TokenBucketRateLimiterConstructorArgs {
  capacity: number;
  consumeAmount: number;
  refillAmount: number;
  refillIntervalInSeconds: number;
}

class TokenBucketRateLimiter implements RateLimiter {
  // Maximum number of tokens in bucket
  private readonly capacity: number;
  // Number of tokens in bucket
  private numberOfTokens: number;
  // Number of tokens shound be consumed for each request
  private readonly consumeAmount: number;
  // Number of tokens should be added to bucket each refillIntervalInSeconds
  private readonly refillAmount: number;
  // Number of seconds shoud bucket be refilled with refillAmount tokens
  private readonly refillIntervalInSeconds: number;
  private refillIntervalId: null | NodeJS.Timeout = null;

  constructor(args: TokenBucketRateLimiterConstructorArgs) {
    this.capacity = args.capacity;
    this.numberOfTokens = args.capacity;
    this.consumeAmount = args.consumeAmount;
    this.refillAmount = args.refillAmount;
    this.refillIntervalInSeconds = args.refillIntervalInSeconds;

    this.startRefillInterval();
  }

  startRefillInterval(): void {
    if (this.refillIntervalId) return;

    this.refillIntervalId = setInterval(() => {
      if (this.numberOfTokens !== this.capacity) {
        // Use Math.min to make sure number of tokens in bucket is always <= bucket's capacity
        this.numberOfTokens = Math.min(
          this.capacity,
          this.numberOfTokens + this.refillAmount,
        );
        logger.info(
          `Added ${this.refillAmount} ${this.refillAmount > 1 ? 'tokens' : 'token'} to bucket, current number of tokens in bucket is ${this.numberOfTokens}`,
        );
      }
    }, this.refillIntervalInSeconds * 1000);
  }

  stopRefillInterval(): void {
    if (this.refillIntervalId) {
      clearInterval(this.refillIntervalId);
      this.refillIntervalId = null;
    }
  }

  allowRequest(): boolean {
    if (this.numberOfTokens > 0) {
      this.numberOfTokens -= this.consumeAmount;
      logger.info(
        `Consumed ${this.consumeAmount} ${this.consumeAmount > 1 ? 'tokens' : 'token'} from bucket, number of tokens left in bucket is ${this.numberOfTokens}`,
      );

      return true;
    }

    return false;
  }
}

export type { TokenBucketRateLimiterConstructorArgs };

export { TokenBucketRateLimiter };
