const CAPACIDAD_MAXIMA = 10000; // 10,000 litros

export function validarCapacidadSurtidor(cantidad) {
  if (typeof cantidad !== 'number' || cantidad <= 0) return false;
  return cantidad <= CAPACIDAD_MAXIMA;
}