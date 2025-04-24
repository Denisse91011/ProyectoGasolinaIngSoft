export function solicitarTicketCarga(surtidor, tipoGasolina, cantidadSolicitada, inventarios) {
  const surtidorDisponible = inventarios.find(item => item.surtidor === surtidor && item.tipoGasolina === tipoGasolina);

  if (!surtidorDisponible) {
    return {
      success: false,
      message: 'Surtidor o tipo de gasolina no disponible.'
    };
  }

  if (cantidadSolicitada > surtidorDisponible.cantidadDisponible) {
    return {
      success: false,
      message: 'Cantidad solicitada supera el inventario disponible. Intente con una cantidad menor.'
    };
  }

  return {
    success: true,
    message: `Ticket generado correctamente. Preséntelo en el surtidor seleccionado.`
  };
}
