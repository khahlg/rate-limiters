import { logger } from '@configs/logger.config.js';
import { RateLimiter } from '@shared/interfaces/rateLimter.interface.js';

interface FixedWindowCounterRateLimiterConstructorArgs {
  windowThreshold: number;
  windowTimeInSeconds: number;
}

class FixedWindowCounterRateLimiter implements RateLimiter {
  // The maximum number of requests a window can receive.
  private readonly windowThreshold: number;
  private readonly windowTimeInSeconds: number;

  private windowNumberOfRequestsReceived: number;
  private createWindowIntervalId: null | NodeJS.Timeout;

  constructor(args: FixedWindowCounterRateLimiterConstructorArgs) {
    this.windowThreshold = args.windowThreshold;
    this.windowTimeInSeconds = args.windowTimeInSeconds;

    this.windowNumberOfRequestsReceived = 0;
    this.createWindowIntervalId = null;

    this.startCreatingWindowInterval();
  }

  startCreatingWindowInterval(): void {
    if (this.createWindowIntervalId) return;

    this.createWindowIntervalId = setInterval(() => this.createNewWindow(), this.windowTimeInSeconds * 1000);
  }

  stopCreatingWindowInterval(): void {
    this.windowNumberOfRequestsReceived = 0;

    if (this.createWindowIntervalId) {
      clearInterval(this.createWindowIntervalId);
      this.createWindowIntervalId = null;
    }
  }

  createNewWindow(): void {
    logger.info('New window created.');
    this.windowNumberOfRequestsReceived = 0;
  }

  allowRequest(): boolean {
    logger.info(`Received new request, window ${this.windowNumberOfRequestsReceived}/${this.windowThreshold}.`);

    if (this.windowNumberOfRequestsReceived >= this.windowThreshold) {
      logger.error('Threshold exeeded, request will be throttled.');
      return false;
    }

    this.windowNumberOfRequestsReceived += 1;
    return true;
  }
}

export type { FixedWindowCounterRateLimiterConstructorArgs };

export { FixedWindowCounterRateLimiter };
