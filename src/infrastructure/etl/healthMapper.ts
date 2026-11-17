import { readVerifiedJson } from './sources.js';
import type { PlaceSeed } from './schoolMapper.js';

interface HealthProperties {
  OBJECTID?: number;
  NOMBRE_DEL?: string;
  NOMBRE?: string;
  'DIRECCIÓN'?: string;
  DIRECCION?: string;
  DIRECCIONC?: string;
  RAZONSOCIA?: string;
  TIPOESTABL?: string;
  tipo_salud?: string;
}

export async function loadHealthSeeds(): Promise<PlaceSeed[]> {
  const data = await readVerifiedJson<{ features: { properties: HealthProperties; geometry: { coordinates: number[] } }[] }>(
    'salud-ciudad-granada.geojson'
  );
  const seen = new Set<string>();
  const seeds: PlaceSeed[] = [];
  for (const feature of data.features) {
    const properties = feature.properties;
    const nombre = providerName(properties);
    const direccion = address(properties);
    const key = properties.OBJECTID === undefined
      ? `${nombre}|${direccion ?? ''}|${feature.geometry.coordinates.join(',')}`
      : `objectid:${properties.OBJECTID}`;
    if (seen.has(key)) continue;
    seen.add(key);
    seeds.push({
      categoria: 'salud',
      nombre,
      descripcion: null,
      direccion,
      sector: null,
      tipo: properties.tipo_salud ?? 'otro',
      lat: feature.geometry.coordinates[1] ?? 0,
      lon: feature.geometry.coordinates[0] ?? 0,
      fuente: 'F-05'
    });
  }
  return seeds;
}

function providerName(properties: HealthProperties): string {
  const named = text(properties.NOMBRE_DEL) || text(properties.NOMBRE);
  if (named) return named;
  const razonSocial = text(properties.RAZONSOCIA);
  if (razonSocial && !/^\d+$/.test(razonSocial)) return razonSocial;
  const tipo = text(properties.TIPOESTABL) || 'Establecimiento de salud';
  return `${tipo} sin razón social`;
}

function address(properties: HealthProperties): string | null {
  return text(properties['DIRECCIÓN']) || text(properties.DIRECCION) || text(properties.DIRECCIONC) || null;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
