import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from '../../../lib/httpError.js';

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: 'RUTA_NO_ENCONTRADA',
      message: `No existe la ruta ${req.method} ${req.path}`,
      requestId: res.locals.requestId ?? null
    }
  });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const requestId = res.locals.requestId ?? null;
  if (error instanceof HttpError) {
    res.status(error.status).json({
      error: { code: error.code, message: error.message, requestId }
    });
    return;
  }
  console.error(JSON.stringify({ level: 'error', requestId, message: String(error) }));
  res.status(500).json({
    error: {
      code: 'ERROR_INTERNO',
      message: 'No fue posible completar la solicitud',
      requestId
    }
  });
};
