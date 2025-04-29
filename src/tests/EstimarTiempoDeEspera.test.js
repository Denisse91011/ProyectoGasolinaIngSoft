import { EstimarTiempoDeEspera } from '../EstimarTiempoDeEspera.js';

describe('HU6 - Estimar tiempo de carga de gasolina', () => {
  it('debería calcular el tiempo estimado correctamente', () => {
    expect(EstimarTiempoDeEspera(4, 5)).toBe(20); 
  });
});
