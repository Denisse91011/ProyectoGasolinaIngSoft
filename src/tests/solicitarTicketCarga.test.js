import { solicitarTicketCarga } from '../solicitarTicketCarga';

describe('Función de solicitud de ticket de carga', () => {

  const inventarios = [
    { surtidor: 'Surtidor 1', tipoGasolina: 'Gasolina', cantidadDisponible: 100 },
    { surtidor: 'Surtidor 2', tipoGasolina: 'Diésel', cantidadDisponible: 50 }
  ];

  it('debería mostrar "Ticket generado correctamente. Preséntelo en el surtidor seleccionado." cuando la cantidad solicitada es válida y no supera el inventario', () => {
    const resultado = solicitarTicketCarga('Surtidor 1', 'Gasolina', 50, inventarios);
    expect(resultado.success).toBe(true);
    expect(resultado.message).toBe('Ticket generado correctamente. Preséntelo en el surtidor seleccionado.');
  });

  it('debería mostrar "Cantidad solicitada supera el inventario disponible. Intente con una cantidad menor." cuando la cantidad solicitada supera el inventario disponible', () => {
    const resultado = solicitarTicketCarga('Surtidor 1', 'Gasolina', 150, inventarios);
    expect(resultado.success).toBe(false);
    expect(resultado.message).toBe('Cantidad solicitada supera el inventario disponible. Intente con una cantidad menor.');
  });

});
