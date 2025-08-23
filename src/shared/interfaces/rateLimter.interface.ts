import { NextFunction, Request, Response } from 'express';

interface ExpressRequestContext {
  req: Request;
  res: Response;
  next: NextFunction;
}

interface CustomExpressRequestContext extends ExpressRequestContext {
  id: string;
}

interface RateLimiter {
  allowRequest({
    expressRequestContext,
  }: {
    expressRequestContext: ExpressRequestContext;
  }): boolean;
  setHeaders({
    expressRequestContext,
  }: {
    expressRequestContext: ExpressRequestContext;
  }): void;
}

export type { CustomExpressRequestContext, ExpressRequestContext, RateLimiter };
