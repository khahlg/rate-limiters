import { logger } from '@configs/index.config.js';
import type {
  CustomExpressRequestContext,
  ExpressRequestContext,
  RateLimiter,
} from '@shared/interfaces/rateLimter.interface.js';

interface LeakingBucketRateLimiterConstructorArgs {
  queueCapacity: number;
  leakingRequestsRate: number[];
}

class LeakingBucketRateLimiter implements RateLimiter {
  // The FIFO Queue where requests are pushed to.
  private readonly queue: CustomExpressRequestContext[];
  // The maximum number of requests can be added to queue.
  // If queue is full then request will be dropped and response with status 429 (Too many requests).
  private readonly queueCapacity: number;
  // Leaking rate, an array of two values.
  // The first value is the number of requests that will be processed in a given period of time, which is the second value.
  // The second value is the time interval during which the specified number of requests are processed.
  private readonly leakingRequestsRate: number[];

  private leakingRequestsIntervalId: null | NodeJS.Timeout;
  private numberOfRequestsReceived: number;

  constructor(args: LeakingBucketRateLimiterConstructorArgs) {
    this.queue = [];
    this.queueCapacity = args.queueCapacity;
    this.leakingRequestsRate = args.leakingRequestsRate;

    this.leakingRequestsIntervalId = null;
    this.numberOfRequestsReceived = 0;

    this.startLeakingRequestsInterval();
  }

  processRequest() {
    if (this.queue.length > 0) {
      const expressRequestContext = this.queue.pop();

      if (expressRequestContext) {
        logger.info(`Start processing request with id: ${expressRequestContext.id}`);
        return expressRequestContext.next();
      }
    }
  }

  startLeakingRequestsInterval(): void {
    if (this.leakingRequestsIntervalId) return;

    this.leakingRequestsIntervalId = setInterval(
      () => this.processRequest(),
      (this.leakingRequestsRate[1] * 1000) / this.leakingRequestsRate[0],
    );
  }

  stopLeakingRequestsInterval(): void {
    if (this.leakingRequestsIntervalId) {
      clearInterval(this.leakingRequestsIntervalId);
      this.leakingRequestsIntervalId = null;
    }
  }

  pushRequestToQueue(expressRequestContext: ExpressRequestContext): boolean {
    const customExpressRequestContext: CustomExpressRequestContext = {
      ...expressRequestContext,
      id: this.numberOfRequestsReceived.toString(),
    };
    logger.info(`Receive new request, request's id: ${this.numberOfRequestsReceived}`);
    this.numberOfRequestsReceived += 1;

    if (this.queue.length >= this.queueCapacity) {
      logger.error('Queue is fulled, request will be throttled.');
      return false;
    }

    this.queue.unshift(customExpressRequestContext);
    logger.info(
      `Pushed 1 request to queue, request's id: ${customExpressRequestContext.id}, queue capacity: ${this.queue.length}/${this.queueCapacity}.`,
    );

    return true;
  }

  allowRequest({ expressRequestContext }: { expressRequestContext: ExpressRequestContext }): boolean {
    return this.pushRequestToQueue(expressRequestContext);
  }
}

export type { LeakingBucketRateLimiterConstructorArgs };

export { LeakingBucketRateLimiter };
