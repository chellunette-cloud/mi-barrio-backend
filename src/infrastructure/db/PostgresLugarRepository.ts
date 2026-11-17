import type { Pool } from 'pg';
import type { Categoria, Lugar, LugarFiltro, LugarRepository } from '../../domain/places/types.js';
import { CATEGORIAS_SQL, LUGARES_SQL, LUGAR_SQL } from './queries/lugarQueries.js';
import { LUGARES_ADMIN_SQL, LUGAR_ADMIN_SQL } from './queries/lugarAdminQueries.js';
import type { CategoriaRow, LugarRow } from './queries/rowTypes.js';
import { mapCategoria, mapLugar } from './mappers/mapLugar.js';

export class PostgresLugarRepository implements LugarRepository {
  constructor(private readonly pool: Pool) {}

  async listCategorias(): Promise<Categoria[]> {
    const result = await this.pool.query<CategoriaRow>(CATEGORIAS_SQL);
    return result.rows.map(mapCategoria);
  }

  async listLugares(filtro: LugarFiltro): Promise<Lugar[]> {
    const busqueda = filtro.q ? `%${filtro.q}%` : null;
    const limite = Math.min(Math.max(filtro.limite ?? 500, 1), 1000);
    const result = await this.pool.query<LugarRow>(LUGARES_SQL, [
      filtro.categoria ?? null,
      busqueda,
      limite
    ]);
    return result.rows.map(mapLugar);
  }

  async findLugar(id: number): Promise<Lugar | null> {
    const result = await this.pool.query<LugarRow>(LUGAR_SQL, [id]);
    const row = result.rows[0];
    return row ? mapLugar(row) : null;
  }

  async listLugaresAdmin(): Promise<Lugar[]> {
    const result = await this.pool.query<LugarRow>(LUGARES_ADMIN_SQL);
    return result.rows.map(mapLugar);
  }

  async findLugarAdmin(id: number): Promise<Lugar | null> {
    const result = await this.pool.query<LugarRow>(LUGAR_ADMIN_SQL, [id]);
    const row = result.rows[0];
    return row ? mapLugar(row) : null;
  }

  async createLugar(input: any): Promise<Lugar> {
    const categoria = await this.pool.query<{ id: number }>('SELECT id FROM categoria WHERE codigo = $1', [input.categoriaCodigo]);
    const categoriaId = categoria.rows[0]?.id;
    if (!categoriaId) throw new Error('Categoría inexistente');
    const result = await this.pool.query<{ id: number }>(
      `INSERT INTO lugar (categoria_id, nombre, descripcion, direccion, sector, tipo, codigo, lat, lon, geom, publicado, fuente_principal)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,ST_SetSRID(ST_MakePoint($10,$11),4326),$12,$13) RETURNING id`,
      [categoriaId, input.nombre, input.descripcion ?? null, input.direccion ?? null, input.sector ?? null, input.tipo ?? null, input.codigo ?? null, input.lat, input.lon, input.lon, input.lat, input.publicado ?? true, input.fuentePrincipal ?? 'admin']
    );
    const id = result.rows[0]?.id;
    if (!id) throw new Error('No se pudo crear el lugar');
    const lugar = await this.findLugarAdmin(id);
    if (!lugar) throw new Error('No se pudo leer el lugar');
    return lugar;
  }

  async updateLugar(id: number, input: any): Promise<Lugar | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let index = 1;
    for (const [key, column] of Object.entries({
      nombre: 'nombre', descripcion: 'descripcion', direccion: 'direccion',
      sector: 'sector', tipo: 'tipo', lat: 'lat', lon: 'lon', publicado: 'publicado'
    })) {
      if (input[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(input[key]);
      }
    }
    if (fields.length === 0) return this.findLugarAdmin(id);
    values.push(id);
    await this.pool.query(`UPDATE lugar SET ${fields.join(', ')}, actualizado_en = now() WHERE id = $${index}`, values);
    if (input.lat !== undefined || input.lon !== undefined) {
      await this.pool.query(`UPDATE lugar SET geom = ST_SetSRID(ST_MakePoint(lon, lat), 4326) WHERE id = $1`, [id]);
    }
    return this.findLugarAdmin(id);
  }

  async deleteLugar(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM lugar WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async setPublished(id: number, publicado: boolean): Promise<Lugar | null> {
    await this.pool.query('UPDATE lugar SET publicado = $1, actualizado_en = now() WHERE id = $2', [publicado, id]);
    return this.findLugarAdmin(id);
  }
}