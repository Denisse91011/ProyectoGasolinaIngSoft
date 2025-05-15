export class surtidor {
  constructor(nombre, tipoCombustible) {
    this.nombre = nombre;
    this.tipoCombustible = tipoCombustible;
    this.ingresos = [];
    this.CAPACIDAD_MAXIMA = 10000;
  }

  agregarSurtidor() {
    if (!this.nombre || !this.tipoCombustible) {
      return {
        success: false,
        message: 'Debe proporcionar nombre y tipo de combustible del surtidor.'
      };
    }

    return {
      success: true,
      message: 'Surtidor agregado correctamente.',
      data: {
        nombre: this.nombre,
        tipoCombustible: this.tipoCombustible
      }
    };
  }

  validarCapacidadSurtidor(cantidad) {
    if (typeof cantidad !== 'number') {
      return { valid: false, message: 'La cantidad debe ser un número.' };
    }
    if (cantidad <= 0) {
      return { valid: false, message: 'La cantidad debe ser positiva.' };
    }
    if (cantidad > this.CAPACIDAD_MAXIMA) {
      return {
        valid: false,
        message: `Error: La cantidad excede la capacidad máxima de ${this.CAPACIDAD_MAXIMA} litros.`
      };
    }

    return {
      valid: true,
      message: `Capacidad válida. Máxima: ${this.CAPACIDAD_MAXIMA} litros.`
    };
  }

  reportarIngresoGasolina(cantidad, fechaIngreso) {
    if (cantidad <= 0) {
      return {
        success: false,
        message: 'La cantidad debe ser un número positivo mayor a cero.'
      };
    }

    this.ingresos.push({
      tipoCombustible: this.tipoCombustible,
      cantidad,
      fechaIngreso
    });

    return {
      success: true,
      message: 'Ingreso registrado correctamente.',
      data: {
        tipoCombustible: this.tipoCombustible,
        cantidad,
        fechaIngreso
      }
    };
  }

  consultarStock() {
    return this.ingresos
      .filter(i => i.tipoCombustible === this.tipoCombustible)
      .reduce((total, i) => total + i.cantidad, 0);
  }

  estimarAbastecimiento(litrosPorAuto, cantidadAutos) {
    const stock = this.consultarStock();

    if (litrosPorAuto <= 0 || cantidadAutos <= 0) {
      return {
        suficiente: false,
        autosPosibles: 0
      };
    }

    const litrosNecesarios = litrosPorAuto * cantidadAutos;
    const autosPosibles = Math.floor(stock / litrosPorAuto);

    return {
      suficiente: stock >= litrosNecesarios,
      autosPosibles
    };
  }
}
