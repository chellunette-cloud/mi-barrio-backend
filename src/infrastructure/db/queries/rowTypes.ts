import type { GeoJsonPolygon } from '../../../domain/barrio/types.js';

export interface FuenteRow {
  codigo: string;
  entidad: string;
  url: string;
  fecha_consulta: string;
  licencia: string;
  campos: string[];
}

export interface BarrioRow {
  slug: string;
  nombre: string;
  nombre_mostrar: string;
  codigo_id: string | null;
  localidad_codigo: string;
  localidad_nombre: string;
  upz_codigo: string;
  upz_nombre: string;
  upl: string;
  area_ha: number;
  area_m2: number | null;
  lotes: number;
  poblacion_estimada: number;
  densidad: number | null;
  estrato_predominante: number | null;
  manzanas_estrato2: number;
  centroide_lat: number;
  centroide_lon: number;
  norte: number;
  sur: number;
  este: number;
  oeste: number;
  actualizado_en: string;
}

export interface GeometriaRow {
  slug: string;
  nombre: string;
  codigo_id: string | null;
  area_ha: number;
  area_m2: number | null;
  geometria: GeoJsonPolygon;
  centroide_lat: number;
  centroide_lon: number;
  norte: number;
  sur: number;
  este: number;
  oeste: number;
  vertices: number;
  srid: number;
  actualizado_en: string;
}
