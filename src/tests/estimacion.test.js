import { estimarAbastecimiento } from '../estimacion.js';
import { reportarIngresoGasolina } from '../stockCombustible.js';


beforeEach(() => {
  if (typeof resetIngresos === 'function') {
    resetIngresos();
  }
});

describe('estimarAbastecimiento', () => {
  it('debería indicar que el stock es suficiente', () => {
    reportarIngresoGasolina('Regular', 100, '2025-05-06');
    const resultado = estimarAbastecimiento('Regular', 20, 5);
    expect(resultado.suficiente).toBe(true);
    expect(resultado.autosPosibles).toBe(5);
  });

  it('debería indicar que el stock no es suficiente', () => {
    reportarIngresoGasolina('Premium', 30, '2025-05-06');
    const resultado = estimarAbastecimiento('Premium', 20, 5);
    expect(resultado.suficiente).toBe(false);
    expect(resultado.autosPosibles).toBe(1);
  });

  it('debería manejar valores no válidos', () => {
    const resultado = estimarAbastecimiento('Regular', 0, -1);
    expect(resultado.suficiente).toBe(false);
    expect(resultado.autosPosibles).toBe(0);
  });
});
