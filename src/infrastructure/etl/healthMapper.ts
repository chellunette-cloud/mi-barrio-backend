import { readVerifiedJson } from './sources.js';
import type { PlaceSeed } from './schoolMapper.js';

export async function loadHealthSeeds(): Promise<PlaceSeed[]> {
  const data = await readVerifiedJson<any>('salud-ciudad-granada.geojson');
  const seen = new Set<string>();
  const seeds: PlaceSeed[] = [];
  for (const f of data.features) {
    const p = f.properties;
    const nombre = (p.NOMBRE_DEL || p.NOMBRE || '').trim();
    const direccion = (p['DIRECCIÓN'] || '').trim() || null;
    const key = `${nombre}|${direccion ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    seeds.push({
      categoria: 'salud',
      nombre: nombre || 'Servicio de salud sin nombre',
      descripcion: null,
      direccion,
      sector: null,
      tipo: p.tipo_salud || 'otro',
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      fuente: 'F-05'
    });
  }
  return seeds;
}