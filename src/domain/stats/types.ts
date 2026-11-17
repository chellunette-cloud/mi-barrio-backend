export interface GrupoQuinquenal {
  edad: string;
  hombres: number;
  mujeres: number;
  total: number;
}

export interface Demografia {
  barrio: {
    nivel: 'barrio';
    nombre: string;
    poblacion: { valor: number; tipo: string; etiqueta: string };
    estrato: number;
    manzanasEstrato2: number;
    areaHectareas: number;
    densidad: number;
    fuente: string;
  };
  upz: {
    nivel: 'upz';
    codigo: string;
    nombre: string;
    poblacion: { valor: number; anio: number; hombres: number; mujeres: number };
    quinquenios: GrupoQuinquenal[];
    fuente: string;
  };
}

export interface Seguridad {
  cuadrante: {
    nombre: string;
    codigo: string;
    telefono: string;
    upz: string;
    fuente: string;
  };
  indicadores: { nombre: string; nivel: string; periodo: string; fuente: string }[];
  capas: { nombre: string; fuente: string; escala: string }[];
}