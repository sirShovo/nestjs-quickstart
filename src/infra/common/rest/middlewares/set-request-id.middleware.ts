import { HEADER_REQUEST_ID } from '@/app/common/config';
import { NextFunction, Request, Response } from 'express';
import { v4 } from 'uuid';

export function setRequestIdMiddleware(req: Request, _: Response, next: NextFunction) {
  const prevVal = req.headers[HEADER_REQUEST_ID];
  req.headers[HEADER_REQUEST_ID] = prevVal === undefined ? v4() : prevVal;
  next();
}
