import type { Categoria, LugarRepository } from '../../domain/places/types.js';

export class ListCategorias {
  constructor(private readonly repository: LugarRepository) {}

  execute(): Promise<Categoria[]> {
    return this.repository.listCategorias();
  }
}