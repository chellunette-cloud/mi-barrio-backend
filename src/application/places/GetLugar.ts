import type { Lugar, LugarRepository } from '../../domain/places/types.js';

export class GetLugar {
  constructor(private readonly repository: LugarRepository) {}

  execute(id: number): Promise<Lugar | null> {
    return this.repository.findLugar(id);
  }
}