import { reportarIngresoGasolina as originalReporte } from './reportarIngresoGasolina.js';

const ingresos = [];

export function reportarIngresoGasolina(tipoCombustible, cantidad, fechaIngreso) {
  const resultado = originalReporte(tipoCombustible, cantidad, fechaIngreso);

  if (resultado.success) {
    ingresos.push({ tipoCombustible, cantidad, fechaIngreso });
  }

  return resultado;
}

export function consultarStock(tipoCombustible) {
  return ingresos
    .filter(i => i.tipoCombustible === tipoCombustible)
    .reduce((total, i) => total + i.cantidad, 0);
}
