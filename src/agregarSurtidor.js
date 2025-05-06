
export function agregarSurtidor(nombre, tipoCombustible) {
    if (!nombre || !tipoCombustible) {
      return {
        success: false,
        message: 'Debe proporcionar nombre y tipo de combustible del surtidor.'
      };
    }
  
    return {
      success: true,
      message: 'Surtidor agregado correctamente.',
      data: { nombre, tipoCombustible }
    };
  }
  