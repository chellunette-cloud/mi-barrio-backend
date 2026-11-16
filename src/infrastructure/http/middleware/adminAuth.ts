import type { NextFunction, Request, Response } from 'express';
import type { JwtService } from '../../auth/JwtService.js';
import { HttpError } from '../../../lib/httpError.js';

export function createAdminAuth(jwt: JwtService) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      next(new HttpError(401, 'NO_AUTORIZADO', 'Token de administrador ausente'));
      return;
    }
    try {
      const payload = jwt.verifyAccess(token);
      (req as Request & { admin?: { username: string; role: string } }).admin = payload;
      next();
    } catch {
      next(new HttpError(401, 'TOKEN_INVALIDO', 'Token de administrador inválido'));
    }
  };
}