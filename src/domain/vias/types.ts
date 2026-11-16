export interface Via {
  id: number;
  nombre: string | null;
  highway: string;
  coordenadas: number[][];
  dentroBarrio: boolean;
  fuentePrincipal: string;
}

export interface ViaRepository {
  listVias(highway?: string): Promise<Via[]>;
}