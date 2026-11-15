export interface Fuente {
  codigo: string;
  entidad: string;
  url: string;
  fechaConsulta: string;
  licencia: string;
  campos: string[];
}

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface Barrio {
  slug: string;
  nombre: string;
  nombreMostrar: string;
  codigoId: string | null;
  localidad: { codigo: string; nombre: string };
  upz: { codigo: string; nombre: string };
  upl: string;
  area: { hectareas: number; metrosCuadrados: number };
  lotes: number;
  poblacion: { valor: number; tipo: 'estimacion'; etiqueta: string };
  densidad: number | null;
  estratoPredominante: number | null;
  manzanasEstrato2: number;
  centroide: { lat: number; lon: number };
  limites: { norte: number; sur: number; este: number; oeste: number };
  actualizadoEn: string;
  fuentes: Fuente[];
}

export interface BarrioGeometria {
  slug: string;
  nombre: string;
  codigoId: string | null;
  geometria: GeoJsonPolygon;
  centroide: { lat: number; lon: number };
  limites: { norte: number; sur: number; este: number; oeste: number };
  area: { hectareas: number; metrosCuadrados: number };
  vertices: number;
  srid: number;
  actualizadoEn: string;
  fuente: Fuente;
}

export interface BarrioRepository {
  findBarrio(): Promise<Barrio | null>;
  findGeometria(): Promise<BarrioGeometria | null>;
}
