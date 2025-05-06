import { validarCapacidadSurtidor, CAPACIDAD_MAXIMA } from '../capacidadSurtidor.js'; 

describe('Capacidad de Surtidor', () => {
  it('debería rechazar cantidades negativas', () => {
    const result = validarCapacidadSurtidor(-100);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('positiva'); // Check message content
  });

  it('debería rechazar cantidades no numéricas', () => {
    const result = validarCapacidadSurtidor('abc');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('número');
  });

  it('debería aceptar cantidades dentro del límite', () => {
    expect(validarCapacidadSurtidor(5000).valid).toBe(true);
    expect(validarCapacidadSurtidor(CAPACIDAD_MAXIMA).valid).toBe(true); // Use the constant
  });

  it('debería rechazar cantidades excesivas', () => {
    const result = validarCapacidadSurtidor(CAPACIDAD_MAXIMA + 1);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('excede');
  });

  it('debería rechazar cero', () => {
    const result = validarCapacidadSurtidor(0);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('positiva');
   });
});