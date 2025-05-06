import { consultarStock } from './stockCombustible.js';

export function estimarAbastecimiento(tipoCombustible, litrosPorAuto, cantidadAutos) {
  const stock = consultarStock(tipoCombustible);

  if (litrosPorAuto <= 0 || cantidadAutos <= 0) {
    return { suficiente: false, autosPosibles: 0 };
  }

  const litrosNecesarios = litrosPorAuto * cantidadAutos;
  const autosPosibles = Math.floor(stock / litrosPorAuto);

  return {
    suficiente: stock >= litrosNecesarios,
    autosPosibles
  };
}
