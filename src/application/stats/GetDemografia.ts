import type { Demografia } from '../../domain/stats/types.js';
import type { StaticStatsRepository } from '../../infrastructure/stats/StaticStatsRepository.js';

export class GetDemografia {
  constructor(private readonly repository: StaticStatsRepository) {}
  execute(): Demografia {
    return this.repository.demografia();
  }
}