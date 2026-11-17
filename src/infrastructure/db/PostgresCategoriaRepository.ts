import type { Pool } from 'pg';
import type {
  Categoria,
  CategoriaDeleteResult,
  CategoriaInput,
  CategoriaRepository
} from '../../domain/places/types.js';
import { CategoriaCodigoDuplicadoError } from '../../domain/places/types.js';
import { CATEGORIA_ADMIN_SQL, CATEGORIAS_ADMIN_SQL } from './queries/categoriaAdminQueries.js';
import type { CategoriaRow } from './queries/rowTypes.js';
import { mapCategoria } from './mappers/mapLugar.js';
import { deleteCategoria } from './categoriaDelete.js';

export class PostgresCategoriaRepository implements CategoriaRepository {
  constructor(private readonly pool: Pool) {}

  async listCategoriasAdmin(): Promise<Categoria[]> {
    const result = await this.pool.query<CategoriaRow>(CATEGORIAS_ADMIN_SQL);
    return result.rows.map(mapCategoria);
  }

  async findCategoria(id: number): Promise<Categoria | null> {
    const result = await this.pool.query<CategoriaRow>(CATEGORIA_ADMIN_SQL, [id]);
    return result.rows[0] ? mapCategoria(result.rows[0]) : null;
  }

  async createCategoria(input: CategoriaInput): Promise<Categoria> {
    try {
      const result = await this.pool.query<CategoriaRow>(
        `INSERT INTO categoria (codigo, nombre, descripcion, activa)
         VALUES ($1, $2, $3, $4)
         RETURNING id, codigo, nombre, descripcion, activa`,
        [input.codigo, input.nombre, input.descripcion, input.activa ?? true]
      );
      const row = result.rows[0];
      if (!row) throw new Error('No se pudo crear la categoría');
      return mapCategoria(row);
    } catch (error) {
      throw duplicateCode(error, input.codigo);
    }
  }

  async updateCategoria(id: number, input: Partial<CategoriaInput>): Promise<Categoria | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let index = 1;
    for (const [key, column] of Object.entries({
      codigo: 'codigo',
      nombre: 'nombre',
      descripcion: 'descripcion',
      activa: 'activa'
    })) {
      if (input[key as keyof CategoriaInput] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(input[key as keyof CategoriaInput]);
      }
    }
    if (fields.length === 0) return this.findCategoria(id);
    values.push(id);
    try {
      await this.pool.query(
        `UPDATE categoria SET ${fields.join(', ')}, actualizado_en = now() WHERE id = $${index}`,
        values
      );
      return this.findCategoria(id);
    } catch (error) {
      throw duplicateCode(error, input.codigo ?? String(id));
    }
  }

  async deleteCategoria(id: number, reasignarA?: number): Promise<CategoriaDeleteResult> {
    return deleteCategoria(this.pool, id, reasignarA);
  }
}

function duplicateCode(error: unknown, codigo: string): unknown {
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
    return new CategoriaCodigoDuplicadoError(codigo);
  }
  return error;
}
