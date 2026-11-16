export interface Categoria {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activa: boolean;
}

export interface Lugar {
  id: number;
  categoriaId: number;
  categoriaCodigo: string;
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  sector: string | null;
  tipo: string | null;
  lat: number;
  lon: number;
  dentroBarrio: boolean;
  distanciaM: number | null;
  publicado: boolean;
  fuentePrincipal: string;
  fuentes: string[];
}

export interface LugarFiltro {
  categoria?: string;
  q?: string;
  limite?: number;
}
export interface LugarRepository {
  listCategorias(): Promise<Categoria[]>;
  listLugares(filtro: LugarFiltro): Promise<Lugar[]>;
  findLugar(id: number): Promise<Lugar | null>;
}
