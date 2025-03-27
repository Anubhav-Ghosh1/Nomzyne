import rateLimit from 'express-rate-limit';
import { Request } from 'express';

interface RateLimitRequest extends Request {
  user?: { id: string };
}

export const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  headers: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: RateLimitRequest) => {
    return req.user?.id.toString() || req.ip || "";
  },
});