import { z } from 'zod';
import { HttpError } from '../../../lib/httpError.js';

const CENTRO = { lat: 4.641833, lon: -74.171758 };
const RADIO_AREA_M = 2000;

export function dentroArea(lat: number, lon: number): boolean {
  const rad = Math.PI / 180;
  const dLat = (lat - CENTRO.lat) * rad;
  const dLon = (lon - CENTRO.lon) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(CENTRO.lat * rad) * Math.cos(lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) <= RADIO_AREA_M;
}

export function invalidData(error: z.ZodError): HttpError {
  const fields = [...new Set(error.issues.map((issue) => issue.path.join('.')).filter(Boolean))];
  return new HttpError(400, 'DATOS_INVALIDOS', `Datos inválidos: ${fields.join(', ')}`);
}
