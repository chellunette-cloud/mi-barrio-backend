import type { Lugar, LugarFiltro, LugarRepository } from '../../domain/places/types.js';

export class ListLugares {
  constructor(private readonly repository: LugarRepository) {}

  execute(filtro: LugarFiltro): Promise<Lugar[]> {
    return this.repository.listLugares(filtro);
  }
}