
let nextTicketId = 1;

export const TICKET_STATUS = {
    GENERADO: "Generado",
    COMPLETADO: "Completado", 
    CANCELADO: "Cancelado",
};

export function generarTicketCarga(surtidorNombre, tipoCombustible, cantidadLitros, fechaStr, placaVehiculo) {
    const cantidad = parseFloat(cantidadLitros);
    if (isNaN(cantidad) || cantidad <= 0) {
        return { success: false, message: "Cantidad inválida: debe ingresar un valor positivo" };
    }

    if (!surtidorNombre || !tipoCombustible || !fechaStr || !placaVehiculo) {
        return { success: false, message: "Por favor, complete todos los campos requeridos (surtidor, tipo, cantidad, fecha, placa)." };
    }

    const numeroTicket = nextTicketId++;

    const ahora = new Date();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const fechaHora = `${fechaStr} ${hora}:${minutos}`;

    const ticket = {
        numeroTicket: numeroTicket,
        surtidorNombre: surtidorNombre,
        tipoCombustible: tipoCombustible,
        cantidadCargada: cantidad,
        fechaHora: fechaHora,
        placaVehiculo: placaVehiculo,
        status: TICKET_STATUS.GENERADO,
        notificado: false 
    };

    return { success: true, ticket: ticket };
}



export function cancelarTicketCarga(numeroTicketToCancel, allTickets) {
    const ticketNumber = parseInt(numeroTicketToCancel); 

    const failedAttempt = {
        ticketNumber: isNaN(ticketNumber) ? numeroTicketToCancel : ticketNumber,
        timestamp: new Date().toLocaleString(),
        reason: "" 
    };

   
    const ticket = allTickets.find(t => t.numeroTicket === ticketNumber);


    if (!ticket) {
        failedAttempt.reason = "Ticket inexistente.";
        return { success: false, message: "Error: No es posible cancelar este ticket - verifique el estado o número de folio", failedAttempt: failedAttempt };
    }

    if (ticket.status === TICKET_STATUS.COMPLETADO) {
         failedAttempt.reason = `Ticket en estado "${TICKET_STATUS.COMPLETADO}".`;
        return { success: false, message: "Error: No es posible cancelar este ticket - verifique el estado o número de folio", failedAttempt: failedAttempt };
    }

    ticket.status = TICKET_STATUS.CANCELADO;

    return { success: true, message: `Ticket #${ticket.numeroTicket} cancelado exitosamente.` };
}


export function resetTicketCounter() {
    nextTicketId = 1;
}

export function verificarTurnoTicket(numeroTicket, surtidorNombre, allTickets) { 
   
    const ticket = allTickets.find(
        t => t.numeroTicket === numeroTicket && t.surtidorNombre === surtidorNombre
    );

    if (!ticket) {
        return {
            notificar: false,
            message: '',
            currentPosition: -1, 
            totalWaiting: 0,
            ticketStatus: null
        };
    }

   
    if (ticket.notificado === undefined) {
        ticket.notificado = false;
    }


    const enEspera = allTickets.filter(
        t => t.status === TICKET_STATUS.GENERADO && t.surtidorNombre === surtidorNombre
    );

    const indexInQueue = enEspera.findIndex(t => t.numeroTicket === numeroTicket);

    const currentPosition = indexInQueue !== -1 ? indexInQueue + 1 : -1;

    if (ticket.status !== TICKET_STATUS.GENERADO || ticket.notificado === true) {
        return {
            notificar: false,
            message: '', 
            currentPosition: currentPosition,
            totalWaiting: enEspera.length,
            ticketStatus: ticket.status
        };
    }

    if (indexInQueue === 3) {
        ticket.notificado = true; 
        const mensaje = `¡Tu turno se acerca! Ticket #${ticket.numeroTicket}`;
        return {
            notificar: true,
            message: mensaje,
            currentPosition: currentPosition,
            totalWaiting: enEspera.length,
            ticketStatus: ticket.status
        };
    }

    return {
        notificar: false,
        message: '',
        currentPosition: currentPosition,
        totalWaiting: enEspera.length,
        ticketStatus: ticket.status
    };
}

