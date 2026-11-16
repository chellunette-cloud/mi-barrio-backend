import { readVerifiedJson } from './sources.js';

export interface PlaceSeed {
  categoria: string;
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  sector: string | null;
  tipo: string | null;
  lat: number;
  lon: number;
  fuente: string;
}

export async function loadSchoolSeeds(): Promise<PlaceSeed[]> {
  const data = await readVerifiedJson<any>('colegios-ciudad-granada.geojson');
  const seen = new Set<string>();
  const seeds: PlaceSeed[] = [];
  for (const f of data.features) {
    const p = f.properties;
    const nombre = (p.NOMBRE_SED || p.NOMBRE_EST || '').trim();
    const direccion = (p.DIRECCION || '').trim() || null;
    const key = `${nombre}|${direccion ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const sector = p.SECTOR === 2 ? 'oficial' : p.SECTOR === 1 ? 'privado' : 'no informado';
    seeds.push({
      categoria: 'educacion',
      nombre,
      descripcion: null,
      direccion,
      sector,
      tipo: 'colegio',
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      fuente: 'F-04'
    });
  }
  return seeds;
}