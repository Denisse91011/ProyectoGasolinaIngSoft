import { reportarIngresoGasolina } from '../reportarIngresoGasolina';

describe('Función de reporte de ingreso de gasolina', () => {

  it('debería mostrar "Ingreso registrado correctamente." cuando la cantidad de gasolina es mayor que cero', () => {
    const resultado = reportarIngresoGasolina('Gasolina', 50, '2025-04-24');
    expect(resultado.success).toBe(true);
    expect(resultado.message).toBe('Ingreso registrado correctamente.');
  });

  it('debería mostrar "La cantidad debe ser un número positivo mayor a cero." cuando la cantidad de gasolina es cero o negativa', () => {
    const resultado1 = reportarIngresoGasolina('Gasolina', 0, '2025-04-24');
    expect(resultado1.success).toBe(false);
    expect(resultado1.message).toBe('La cantidad debe ser un número positivo mayor a cero.');
    const resultado2 = reportarIngresoGasolina('Gasolina', -10, '2025-04-24');
    expect(resultado2.success).toBe(false);
    expect(resultado2.message).toBe('La cantidad debe ser un número positivo mayor a cero.');
  });

});
