import { solicitarTicketCarga } from '../solicitarTicketCarga';

describe('Función de solicitud de ticket de carga', () => {

  const inventarios = [
    { nombreUsuario: 'Juan Perez', tipoGasolina: 'Gasolina', cantidadDisponible: 100 },
    { nombreUsuario: 'Ana López', tipoGasolina: 'Diésel', cantidadDisponible: 50 }
  ];

  it('debería mostrar "Ticket generado correctamente. Preséntelo con el nombre de usuario en el surtidor seleccionado." cuando la cantidad solicitada es válida y no supera el inventario', () => {
    const resultado = solicitarTicketCarga('Juan Perez', 'Gasolina', 50, inventarios);
    expect(resultado.success).toBe(true);
    expect(resultado.message).toBe('Ticket generado correctamente. Preséntelo con el nombre de usuario en el surtidor seleccionado.');
  });

  it('debería mostrar "Cantidad solicitada supera el inventario disponible. Intente con una cantidad menor." cuando la cantidad solicitada supera el inventario disponible', () => {
    const resultado = solicitarTicketCarga('Juan Perez', 'Gasolina', 150, inventarios);
    expect(resultado.success).toBe(false);
    expect(resultado.message).toBe('Cantidad solicitada supera el inventario disponible. Intente con una cantidad menor.');
  });

});
