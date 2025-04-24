export function reportarIngresoGasolina(tipoCombustible, cantidad, fechaIngreso) {
  if (cantidad <= 0) {
    return {
      success: false,
      message: 'La cantidad debe ser un número positivo mayor a cero.'
    };
  }
    return {
    success: true,
    message: 'Ingreso registrado correctamente.'
  };
}
