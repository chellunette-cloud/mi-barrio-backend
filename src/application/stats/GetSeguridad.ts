import type { Seguridad } from '../../domain/stats/types.js';
import type { StaticStatsRepository } from '../../infrastructure/stats/StaticStatsRepository.js';

export class GetSeguridad {
  constructor(private readonly repository: StaticStatsRepository) {}
  execute(): Seguridad {
    return this.repository.seguridad();
  }
}