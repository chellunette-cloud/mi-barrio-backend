import { readVerifiedJson } from './sources.js';
import type { PlaceSeed } from './schoolMapper.js';

function centroid(coords: number[][]): [number, number] {
  let latSum = 0;
  let lonSum = 0;
  for (const coord of coords) {
    lonSum += coord[0] ?? 0;
    latSum += coord[1] ?? 0;
  }
  return [latSum / coords.length, lonSum / coords.length];
}

export async function loadParkSeeds(): Promise<PlaceSeed[]> {
  const data = await readVerifiedJson<any>('parques-ciudad-granada.geojson');
  const seen = new Set<string>();
  const seeds: PlaceSeed[] = [];
  for (const f of data.features) {
    const p = f.properties;
    const nombre = (p.NOMBREPAR || '').trim();
    if (!nombre || seen.has(nombre)) continue;
    seen.add(nombre);
    const [lat, lon] = centroid(f.geometry.coordinates[0]);
    seeds.push({
      categoria: 'parques',
      nombre,
      descripcion: null,
      direccion: null,
      sector: null,
      tipo: p.TIPOPARQUE || null,
      lat,
      lon,
      fuente: 'F-06'
    });
  }
  return seeds;
}