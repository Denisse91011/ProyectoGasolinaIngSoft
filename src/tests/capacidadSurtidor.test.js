import { validarCapacidadSurtidor } from '../capacidadSurtidor.js';

describe('Capacidad de Surtidor', () => {
  it('debería rechazar cantidades negativas', () => {
    expect(validarCapacidadSurtidor(-100)).toBe(false);
  });
  
  it('debería aceptar cantidades dentro del límite', () => {
    expect(validarCapacidadSurtidor(5000)).toBe(true);
    expect(validarCapacidadSurtidor(10000)).toBe(true);
  });
  
  it('debería rechazar cantidades excesivas', () => {
    expect(validarCapacidadSurtidor(10001)).toBe(false);
  });
});