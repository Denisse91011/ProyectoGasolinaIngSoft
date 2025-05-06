
import { reportarIngresoGasolina } from '../reportarIngresoGasolina.js';

describe('Función de reporte de ingreso de gasolina', () => {
  it('debería mostrar éxito cuando la cantidad es mayor que cero', () => {
    const resultado = reportarIngresoGasolina('Gasolina', 50, '2025-04-24');
    expect(resultado.success).toBe(true);
    expect(resultado.message).toBe('Ingreso registrado correctamente.');
    expect(resultado.data).toEqual({
      tipoCombustible: 'Gasolina',
      cantidad: 50,
      fechaIngreso: '2025-04-24'
    });
  });

  it('debería mostrar error cuando la cantidad es cero o negativa', () => {
    const resultado1 = reportarIngresoGasolina('Gasolina', 0, '2025-04-24');
    expect(resultado1.success).toBe(false);
    expect(resultado1.message).toBe('La cantidad debe ser un número positivo mayor a cero.');

    const resultado2 = reportarIngresoGasolina('Gasolina', -10, '2025-04-24');
    expect(resultado2.success).toBe(false);
    expect(resultado2.message).toBe('La cantidad debe ser un número positivo mayor a cero.');
  });
});
