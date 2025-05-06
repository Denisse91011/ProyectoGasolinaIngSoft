export const CAPACIDAD_MAXIMA = 10000;

export function validarCapacidadSurtidor(cantidad) {
  if (typeof cantidad !== 'number') {
    return { valid: false, message: 'La cantidad debe ser un número.' };
  }
  if (cantidad <= 0) {
   
    return { valid: false, message: 'La cantidad debe ser positiva.' };
  }
  if (cantidad > CAPACIDAD_MAXIMA) {
    return { valid: false, message: `Error: La cantidad excede la capacidad máxima de ${CAPACIDAD_MAXIMA} litros.` };
  }

  return { valid: true, message: `Capacidad válida. Máxima: ${CAPACIDAD_MAXIMA} litros.` };
}