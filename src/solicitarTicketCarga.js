export function solicitarTicketCarga(nombreUsuario, tipoGasolina, cantidadSolicitada, inventarios) {
  const usuarioDisponible = inventarios.find(item => item.nombreUsuario === nombreUsuario && item.tipoGasolina === tipoGasolina);

  if (!usuarioDisponible) {
    return {
      success: false,
      message: 'Usuario o tipo de gasolina no disponible.'
    };
  }

  if (cantidadSolicitada > usuarioDisponible.cantidadDisponible) {
    return {
      success: false,
      message: 'Cantidad solicitada supera el inventario disponible. Intente con una cantidad menor.'
    };
  }

  return {
    success: true,
    message: `Ticket generado correctamente. Preséntelo con el nombre de usuario en el surtidor seleccionado.`
  };
}
