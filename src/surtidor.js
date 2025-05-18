export const CAPACIDAD_MAXIMA = 10000;

export class surtidor {
  constructor(nombre, tipoCombustible) {
    this.nombre = nombre;
    this.tipoCombustible = tipoCombustible;
    this.stock = 0;
    this.historialIngresos = [];
  }

  agregarSurtidor() {
    if (!this.nombre || !this.tipoCombustible) {
      return "Por favor, complete todos los campos.";
    }

    return `Surtidor ${this.nombre} de tipo ${this.tipoCombustible} agregado correctamente.`;
  }

  reportarIngresoGasolina(cantidad, fecha) {
    if (cantidad <= 0 || !fecha) {
      return "Por favor, ingrese una cantidad válida y una fecha.";
    }

    if (!this.validarCapacidadSurtidor(cantidad)) {
      return "La cantidad ingresada excede la capacidad máxima del surtidor.";
    }

    this.stock += cantidad;
    this.historialIngresos.push({ cantidad, fecha });
    return `Ingreso de ${cantidad} litros registrado correctamente para el surtidor ${this.nombre}.`;
  }

  consultarStock() {
    return this.stock;
  }

  validarCapacidadSurtidor(cantidad) {
    return (this.stock + cantidad <= CAPACIDAD_MAXIMA);
  }

  estimarAbastecimiento(litrosPorAuto, cantidadAutos) {
    const litrosNecesarios = litrosPorAuto * cantidadAutos;
    if (this.stock >= litrosNecesarios) {
      return `Se puede abastecer a los ${cantidadAutos} autos.`;
    } else {
      return `No hay suficiente stock para abastecer a los ${cantidadAutos} autos.`;
    }
  }
}