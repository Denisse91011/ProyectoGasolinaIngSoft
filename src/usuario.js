
let nextTicketId = 1;

export function generarTicketCarga(tipoCombustible, cantidadLitros, fechaStr, placaVehiculo) {
    const cantidad = parseFloat(cantidadLitros);
    if (isNaN(cantidad) || cantidad <= 0) {
        return { success: false, message: "Cantidad inválida: debe ingresar un valor positivo" };
    }

    if (!tipoCombustible || !fechaStr || !placaVehiculo) {
        return { success: false, message: "Por favor, complete todos los campos requeridos (tipo, cantidad, fecha, placa)." };
    }


    const numeroTicket = nextTicketId++;

    const ahora = new Date();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const fechaHora = `${fechaStr} ${hora}:${minutos}`; 

    const ticket = {
        numeroTicket: numeroTicket,
        tipoCombustible: tipoCombustible,
        cantidadCargada: cantidad,
        fechaHora: fechaHora,
        placaVehiculo: placaVehiculo
    };

    return { success: true, ticket: ticket };
}

export function resetTicketCounter() {
    nextTicketId = 1;
}