import type { Demografia, Seguridad } from '../../domain/stats/types.js';

export class StaticStatsRepository {
  demografia(): Demografia {
    return {
      barrio: {
        nivel: 'barrio',
        nombre: 'URBANIZACION CIUDAD GRANADA',
        poblacion: { valor: 3807, tipo: 'estimacion', etiqueta: 'Estimación del registro del barrio' },
        estrato: 2,
        manzanasEstrato2: 34,
        areaHectareas: 9.1,
        densidad: 77.4725,
        fuente: 'F-01'
      },
      upz: {
        nivel: 'upz',
        codigo: '82',
        nombre: 'Patio Bonito',
        poblacion: { valor: 133130, anio: 2025, hombres: 66175, mujeres: 66955 },
        fuente: 'F-03'
      }
    };
  }

  seguridad(): Seguridad {
    return {
      cuadrante: {
        nombre: 'CAI Bellavista',
        codigo: 'MEBOGMNVCCC03E08C04000011',
        telefono: '300 202 6917',
        upz: '82',
        fuente: 'F-08'
      },
      indicadores: [
        { nombre: 'Delitos de alto impacto', nivel: 'Localidad de Kennedy (08)', periodo: '2018-2026', fuente: 'F-09' }
      ],
      capas: [
        { nombre: 'Arbolado urbano', fuente: 'F-10', escala: 'Censo' },
        { nombre: 'Zona de ronda del río Bogotá', fuente: 'F-11', escala: 'POT 2018' },
        { nombre: 'Amenaza de inundación', fuente: 'F-12', escala: 'POT' }
      ]
    };
  }
}