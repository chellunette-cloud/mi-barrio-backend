import type { Categoria, Lugar } from '../../../domain/places/types.js';
import type { CategoriaRow, LugarRow } from '../queries/rowTypes.js';

export function mapCategoria(row: CategoriaRow): Categoria {
  return {
    id: row.id,
    codigo: row.codigo,
    nombre: row.nombre,
    descripcion: row.descripcion,
    activa: row.activa
  };
}

export function mapLugar(row: LugarRow): Lugar {
  return {
    id: row.id,
    categoriaId: row.categoria_id,
    categoriaCodigo: row.categoria_codigo,
    nombre: row.nombre,
    descripcion: row.descripcion,
    direccion: row.direccion,
    sector: row.sector,
    tipo: row.tipo,
    lat: Number(row.lat),
    lon: Number(row.lon),
    dentroBarrio: row.dentro_barrio,
    distanciaM: row.distancia_m === null ? null : Number(row.distancia_m),
    publicado: row.publicado,
    fuentePrincipal: row.fuente_principal,
    fuentes: row.fuentes ? row.fuentes.split(',') : []
  };
}