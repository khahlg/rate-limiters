import {
  FixedWindowCounterRateLimiter,
  FixedWindowCounterRateLimiterConstructorArgs,
} from '@rateLimiters/fixedWindowCounter.rateLimiter.js';
import {
  LeakingBucketRateLimiter,
  LeakingBucketRateLimiterConstructorArgs,
} from '@rateLimiters/leakingBucket.rateLimiter.js';
import {
  SlidingWindowCounterRateLimiter,
  SlidingWindowCounterRateLimiterConstructorArgs,
} from '@rateLimiters/slidingWindowCounter.rateLimiter.js';
import {
  SlidingWindowLogRateLimiter,
  SlidingWindowLogRateLimiterConstructorArgs,
} from '@rateLimiters/slidingWindowLog.rateLimiter.js';
import {
  TokenBucketRateLimiter,
  TokenBucketRateLimiterConstructorArgs,
} from '@rateLimiters/tokenBucket.rateLimiter.js';

type RateLimiter =
  | FixedWindowCounterRateLimiter
  | LeakingBucketRateLimiter
  | SlidingWindowCounterRateLimiter
  | SlidingWindowLogRateLimiter
  | TokenBucketRateLimiter;

type RateLimiterConstructorArgs =
  | FixedWindowCounterRateLimiterConstructorArgs
  | LeakingBucketRateLimiterConstructorArgs
  | SlidingWindowCounterRateLimiterConstructorArgs
  | SlidingWindowLogRateLimiterConstructorArgs
  | TokenBucketRateLimiterConstructorArgs;

export type { RateLimiter, RateLimiterConstructorArgs };
