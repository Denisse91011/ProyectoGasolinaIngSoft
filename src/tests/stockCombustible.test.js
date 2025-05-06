import { reportarIngresoGasolina, consultarStock } from '../stockCombustible.js';

describe('Consultar Stock', () => {
  it('debería retornar 0 cuando no hay ingresos', () => {
    const stock = consultarStock('Regular');
    expect(stock).toBe(0);
  });

  it('debería sumar correctamente los ingresos del mismo tipo', () => {
    reportarIngresoGasolina('Regular', 100, '2023-01-01');
    reportarIngresoGasolina('Regular', 50, '2023-01-02');

    const stock = consultarStock('Regular');
    expect(stock).toBe(150);
  });
});
