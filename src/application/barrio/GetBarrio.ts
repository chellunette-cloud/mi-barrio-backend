import type { Barrio, BarrioRepository } from '../../domain/barrio/types.js';

export class GetBarrio {
  constructor(private readonly repository: BarrioRepository) {}

  execute(): Promise<Barrio | null> {
    return this.repository.findBarrio();
  }
}
