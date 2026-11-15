import type { BarrioGeometria, BarrioRepository } from '../../domain/barrio/types.js';

export class GetBarrioGeometria {
  constructor(private readonly repository: BarrioRepository) {}

  execute(): Promise<BarrioGeometria | null> {
    return this.repository.findGeometria();
  }
}
