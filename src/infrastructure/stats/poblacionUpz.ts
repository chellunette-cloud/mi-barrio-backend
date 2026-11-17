import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { GrupoQuinquenal } from '../../domain/stats/types.js';

export interface PoblacionUpz {
  nivel: 'upz';
  codigo: string;
  nombre: string;
  localidad: string;
  anio: number;
  area: string;
  poblacion: { valor: number; hombres: number; mujeres: number };
  grupos: GrupoQuinquenal[];
  fuente: string;
  url: string;
  datasetUrl: string;
  consultedAt: string;
  licencia: string;
  archivoOrigenSha256: string;
}

const sourceDir = join(process.cwd(), 'data', 'source');
const fileName = 'poblacion-upz-082-2025.json';
let cached: PoblacionUpz | null = null;

export function loadPoblacionUpz(): PoblacionUpz {
  if (cached) return cached;
  const manifest = JSON.parse(readFileSync(join(sourceDir, 'manifest.json'), 'utf8')) as {
    files: { path: string; sha256: string }[];
  };
  const entry = manifest.files.find((item) => item.path === fileName);
  if (!entry) throw new Error(`${fileName} no está declarado en manifest.json`);
  const content = readFileSync(join(sourceDir, fileName));
  const hash = createHash('sha256').update(content).digest('hex').toUpperCase();
  if (hash !== entry.sha256) throw new Error(`Hash inválido para ${fileName}`);
  cached = JSON.parse(content.toString('utf8').replace(/^\uFEFF/, '')) as PoblacionUpz;
  validate(cached);
  return cached;
}

function validate(data: PoblacionUpz): void {
  if (data.grupos.length !== 18) throw new Error('F-03 debe contener 18 quinquenios');
  const men = data.grupos.reduce((total, group) => total + group.hombres, 0);
  const women = data.grupos.reduce((total, group) => total + group.mujeres, 0);
  if (men !== data.poblacion.hombres || women !== data.poblacion.mujeres) {
    throw new Error('Los totales de F-03 no coinciden con sus quinquenios');
  }
}
