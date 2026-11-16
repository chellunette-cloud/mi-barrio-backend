import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { LoginAdmin } from '../../../application/auth/LoginAdmin.js';
import type { RefreshSession } from '../../../application/auth/RefreshSession.js';
import { HttpError } from '../../../lib/httpError.js';

export interface AuthControllerDependencies {
  login: LoginAdmin;
  refresh: RefreshSession;
}

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1)
});

export function createAuthController(deps: AuthControllerDependencies) {
  return {
    login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const body = loginSchema.parse(req.body);
        res.json(await deps.login.execute(body.username, body.password));
      } catch (error) {
        next(error instanceof z.ZodError ? new HttpError(400, 'DATOS_INVALIDOS', 'Datos inválidos') : error);
      }
    },
    refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const body = z.object({ refreshToken: z.string().min(1) }).parse(req.body);
        res.json(await deps.refresh.execute(body.refreshToken));
      } catch (error) {
        next(error instanceof z.ZodError ? new HttpError(400, 'DATOS_INVALIDOS', 'Datos inválidos') : error);
      }
    }
  };
}