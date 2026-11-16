import type { Via, ViaRepository } from '../../domain/vias/types.js';

export class ListVias {
  constructor(private readonly repository: ViaRepository) {}
  execute(highway?: string): Promise<Via[]> {
    return this.repository.listVias(highway);
  }
}