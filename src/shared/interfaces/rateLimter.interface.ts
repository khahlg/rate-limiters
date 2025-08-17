interface RateLimiter {
  allowRequest(): boolean;
}

export type { RateLimiter };
