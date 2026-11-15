import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';

function sameToken(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function requireServiceToken(expected: string): RequestHandler {
  return (req, res, next) => {
    const provided = req.header('x-service-token');
    if (!provided || !sameToken(provided, expected)) {
      res.status(401).json({
        error: {
          code: 'NO_AUTORIZADO',
          message: 'Token de servicio inválido o ausente',
          requestId: res.locals.requestId ?? null
        }
      });
      return;
    }
    next();
  };
}
