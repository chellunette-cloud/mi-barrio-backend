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
  codigo: string | null;
  lat: number;
  lon: number;
  dentroBarrio: boolean;
  distanciaM: number | null;
  publicado: boolean;
  fuentePrincipal: string;
  fuentes: string[];
}

export interface CategoriaInput {
  codigo: string;
  nombre: string;
  descripcion: string;
  activa?: boolean;
}

export interface CategoriaDeleteResult {
  status: 'deleted' | 'not_found' | 'has_places' | 'invalid_target';
  lugares: number;
}

export class CategoriaCodigoDuplicadoError extends Error {
  constructor(codigo: string) {
    super(`Ya existe una categoría con el código ${codigo}`);
    this.name = 'CategoriaCodigoDuplicadoError';
  }
}

export interface CategoriaRepository {
  listCategoriasAdmin(): Promise<Categoria[]>;
  findCategoria(id: number): Promise<Categoria | null>;
  createCategoria(input: CategoriaInput): Promise<Categoria>;
  updateCategoria(id: number, input: Partial<CategoriaInput>): Promise<Categoria | null>;
  deleteCategoria(id: number, reasignarA?: number): Promise<CategoriaDeleteResult>;
}

export interface LugarFiltro {
  categoria?: string;
  q?: string;
  limite?: number;
}
export interface LugarRepository {
  listCategorias(): Promise<Categoria[]>;
  listLugares(filtro: LugarFiltro): Promise<Lugar[]>;
  listLugaresAdmin(): Promise<Lugar[]>;
  findLugar(id: number): Promise<Lugar | null>;
  findLugarAdmin(id: number): Promise<Lugar | null>;
  createLugar(input: Omit<Lugar, 'id' | 'categoriaId' | 'categoriaCodigo' | 'dentroBarrio' | 'distanciaM' | 'fuentes'> & { categoriaCodigo: string }): Promise<Lugar>;
  updateLugar(id: number, input: Partial<Omit<Lugar, 'id' | 'categoriaCodigo' | 'dentroBarrio' | 'distanciaM' | 'fuentes'>>): Promise<Lugar | null>;
  deleteLugar(id: number): Promise<boolean>;
  setPublished(id: number, publicado: boolean): Promise<Lugar | null>;
}
