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

export interface CategoriaRow {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activa: boolean;
}

export interface LugarRow {
  id: number;
  categoria_id: number;
  categoria_codigo: string;
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  sector: string | null;
  tipo: string | null;
  codigo: string | null;
  lat: number;
  lon: number;
  dentro_barrio: boolean;
  distancia_m: number | null;
  publicado: boolean;
  fuente_principal: string;
  fuentes: string | null;
}
