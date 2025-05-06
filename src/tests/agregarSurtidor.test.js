
import { agregarSurtidor } from '../agregarSurtidor.js';

describe('Función para agregar surtidor', () => {
  it('debería agregar correctamente un surtidor válido', () => {
    const resultado = agregarSurtidor('Surtidor 1', 'Diesel');
    expect(resultado.success).toBe(true);
    expect(resultado.message).toBe('Surtidor agregado correctamente.');
    expect(resultado.data).toEqual({
      nombre: 'Surtidor 1',
      tipoCombustible: 'Diesel'
    });
  });

  it('debería fallar si falta el nombre o tipo de combustible', () => {
    const sinNombre = agregarSurtidor('', 'Gasolina');
    expect(sinNombre.success).toBe(false);
    expect(sinNombre.message).toBe('Debe proporcionar nombre y tipo de combustible del surtidor.');

    const sinTipo = agregarSurtidor('Surtidor 2', '');
    expect(sinTipo.success).toBe(false);
    expect(sinTipo.message).toBe('Debe proporcionar nombre y tipo de combustible del surtidor.');
  });
});
