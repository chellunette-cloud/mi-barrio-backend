import { readVerifiedJson } from './sources.js';
import type { PlaceSeed } from './schoolMapper.js';

export async function loadCommerceSeeds(): Promise<PlaceSeed[]> {
  const data = await readVerifiedJson<any>('comercio-osm-ciudad-granada.json');
  const minLon = -74.177758;
  const minLat = 4.635833;
  const maxLon = -74.165758;
  const maxLat = 4.647833;
  const seen = new Set<string>();
  const seeds: PlaceSeed[] = [];
  for (const e of data.elements) {
    const lat = e.lat ?? e.center?.lat;
    const lon = e.lon ?? e.center?.lon;
    if (lat === undefined || lon === undefined) continue;
    if (lat < minLat || lat > maxLat || lon < minLon || lon > maxLon) continue;
    const name = (e.tags?.name || 'Establecimiento sin nombre').trim();
    const key = `${name}|${lat}|${lon}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const address = [e.tags?.['addr:street'], e.tags?.['addr:housenumber']]
      .filter(Boolean)
      .join(' ')
      .trim();
    seeds.push({
      categoria: 'comercio',
      nombre: name,
      descripcion: null,
      direccion: address || null,
      sector: null,
      tipo: e.tags?.shop || null,
      lat,
      lon,
      fuente: 'F-16'
    });
  }
  return seeds;
}