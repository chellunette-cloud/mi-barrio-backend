import { readVerifiedJson } from './sources.js';
import type { PlaceSeed } from './schoolMapper.js';

export async function loadTransportSeeds(): Promise<PlaceSeed[]> {
  const data = await readVerifiedJson<any>('transporte-ciudad-granada.geojson');
  const seen = new Set<string>();
  const seeds: PlaceSeed[] = [];
  for (const f of data.features) {
    const p = f.properties;
    const nombre = (p.PSINOMBRE || p.ETRNOMBRE || '').trim();
    const direccion = (p.PSIDIRECCI || '').trim() || null;
    const key = `${nombre}|${p.tipo_transporte}|${f.geometry.coordinates.join(',')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    seeds.push({
      categoria: 'transporte',
      nombre: nombre || 'Infraestructura de transporte sin nombre',
      descripcion: null,
      direccion,
      sector: null,
      tipo: p.tipo_transporte || 'paradero',
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      fuente: 'F-15'
    });
  }
  return seeds;
}