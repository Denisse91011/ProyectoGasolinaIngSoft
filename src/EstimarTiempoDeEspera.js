export function EstimarTiempoDeEspera(numeroAutos, tiempoPromedioPorAuto) {
    if (numeroAutos <= 0 || tiempoPromedioPorAuto <= 0) {
      return 0;
    }
    return numeroAutos * tiempoPromedioPorAuto;
  }