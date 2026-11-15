export interface PolygonGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface Feature<P> {
  type: 'Feature';
  properties: P;
  geometry: PolygonGeometry;
}

export interface FeatureCollection<P> {
  type: 'FeatureCollection';
  features: Feature<P>[];
}

export interface BarrioProperties {
  NOMBRE: string;
  LLAVE_PLANO: string;
  AREA_TOTAL: number;
  LOTES_TOTAL: number;
  POBLACION_ESTIMADA: number;
  DENSIDAD: number | null;
  CODIGO_UPZ: number | string;
  CODIGO_LOCALIDAD: string;
}

export interface EstratoProperties {
  OBJECTID: number;
  CODIGO_MANZANA: string;
  ESTRATO: number;
  CODIGO_ZONA_ESTRATO: string;
}

export interface AtributosOficiales {
  fuente: FuenteMeta;
  atributos: {
    OBJECTID: number;
    CODIGO_ID: string;
    NOMBRE: string;
    CODIGO_UPL: string;
    AREA_TOTAL: number;
    LOTES_TOTAL: number;
    POBLACION_ESTIMADA: number;
    DENSIDAD: number | null;
  };
}

export interface FuenteMeta {
  codigo: string;
  entidad: string;
  url: string;
  fechaConsulta: string;
  licencia: string;
  descripcion: string;
}
