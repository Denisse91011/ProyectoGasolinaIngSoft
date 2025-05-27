
import { generarTicketCarga, cancelarTicketCarga, resetTicketCounter, verificarTurnoTicket, TICKET_STATUS } from '../usuario.js';

describe('Generación y Cancelación de Ticket de Carga (Usuario)', () => {

    beforeEach(() => {
        resetTicketCounter();
    });

    it('debe generar un ticket exitosamente con datos válidos', () => {
        const surtidor = 'Surtidor 1'; 
        const tipo = 'Gasolina 95';
        const cantidad = 150.75;
        const fecha = '2023-11-01';
        const placa = 'XYZ-789';

        const resultado = generarTicketCarga(surtidor, tipo, cantidad, fecha, placa);

        expect(resultado.success).toBe(true);
        expect(resultado.ticket).toBeDefined();

        expect(resultado.ticket.numeroTicket).toBe(1); 
        expect(resultado.ticket.surtidorNombre).toBe(surtidor); 
        expect(resultado.ticket.tipoCombustible).toBe(tipo);
        expect(resultado.ticket.cantidadCargada).toBe(cantidad);
        expect(resultado.ticket.fechaHora).toContain(fecha);
        expect(resultado.ticket.fechaHora).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
        expect(resultado.ticket.placaVehiculo).toBe(placa);
        expect(resultado.ticket.status).toBe(TICKET_STATUS.GENERADO);
    });

    it('debe generar IDs únicos para tickets consecutivos', () => {
        const surtidor = 'Surtidor A';
        const tipo = 'Diesel';
        const cantidad = 300;
        const fecha = '2023-11-02';
        const placa1 = 'ABC-111';
        const placa2 = 'DEF-222';

        const resultado1 = generarTicketCarga(surtidor, tipo, cantidad, fecha, placa1);
        const resultado2 = generarTicketCarga(surtidor, tipo, cantidad, fecha, placa2);

        expect(resultado1.success).toBe(true);
        expect(resultado2.success).toBe(true);

        expect(resultado1.ticket.numeroTicket).toBe(1);
        expect(resultado2.ticket.numeroTicket).toBe(2);
         expect(resultado1.ticket.status).toBe(TICKET_STATUS.GENERADO);
         expect(resultado2.ticket.status).toBe(TICKET_STATUS.GENERADO);
    });

    it('debe retornar un mensaje de error si la cantidad es cero o negativa al generar', () => {
        const surtidor = 'Surtidor 1';
        const tipo = 'Gasolina 95';
        const fecha = '2023-11-01';
        const placa = 'ABC-123';

        let resultado = generarTicketCarga(surtidor, tipo, 0, fecha, placa);
        expect(resultado.success).toBe(false);
        expect(resultado.message).toBe("Cantidad inválida: debe ingresar un valor positivo");
        expect(resultado.ticket).toBeUndefined();

        resultado = generarTicketCarga(surtidor, tipo, -50, fecha, placa);
        expect(resultado.success).toBe(false);
        expect(resultado.message).toBe("Cantidad inválida: debe ingresar un valor positivo");
        expect(resultado.ticket).toBeUndefined();

        resultado = generarTicketCarga(surtidor, tipo, 'cien', fecha, placa);
        expect(resultado.success).toBe(false);
        expect(resultado.message).toBe("Cantidad inválida: debe ingresar un valor positivo");
        expect(resultado.ticket).toBeUndefined();
    });

     it('debe retornar un mensaje de error si falta el surtidor, tipo, fecha o placa al generar', () => {
         const surtidor = 'Surtidor 1';
         const tipo = 'Gasolina 95';
         const cantidad = 100;
         const fecha = '2023-11-01';
         const placa = 'ABC-123';

       
         let resultado = generarTicketCarga('', tipo, cantidad, fecha, placa);
         expect(resultado.success).toBe(false);
         expect(resultado.message).toBe("Por favor, complete todos los campos requeridos (surtidor, tipo, cantidad, fecha, placa).");

      
         resultado = generarTicketCarga(surtidor, '', cantidad, fecha, placa);
         expect(resultado.success).toBe(false);
         expect(resultado.message).toBe("Por favor, complete todos los campos requeridos (surtidor, tipo, cantidad, fecha, placa).");

      
          resultado = generarTicketCarga(surtidor, tipo, cantidad, '', placa);
         expect(resultado.success).toBe(false);
         expect(resultado.message).toBe("Por favor, complete todos los campos requeridos (surtidor, tipo, cantidad, fecha, placa).");

          resultado = generarTicketCarga(surtidor, tipo, cantidad, fecha, '');
         expect(resultado.success).toBe(false);
         expect(resultado.message).toBe("Por favor, complete todos los campos requeridos (surtidor, tipo, cantidad, fecha, placa).");
     });


    it('debe cancelar un ticket con estado "Generado" exitosamente', () => {
        const ticket1 = generarTicketCarga('Surtidor 1', 'Gasolina 95', 50, '2023-11-05', 'ABC-123').ticket;
        const ticket2 = generarTicketCarga('Surtidor 2', 'Diesel', 100, '2023-11-05', 'DEF-456').ticket;
        const allTickets = [ticket1, ticket2]; 

        expect(ticket1.status).toBe(TICKET_STATUS.GENERADO); 

        const resultadoCancelacion = cancelarTicketCarga(ticket1.numeroTicket, allTickets);

        expect(resultadoCancelacion.success).toBe(true);
        expect(resultadoCancelacion.message).toBe(`Ticket #${ticket1.numeroTicket} cancelado exitosamente.`);
        expect(resultadoCancelacion.failedAttempt).toBeUndefined(); 

        expect(ticket1.status).toBe(TICKET_STATUS.CANCELADO);
        expect(ticket2.status).toBe(TICKET_STATUS.GENERADO);
    });

     it('debe cancelar un ticket con estado "Cancelado" nuevamente (ser idempotente)', () => {
        const ticket1 = generarTicketCarga('Surtidor 1', 'Gasolina 95', 50, '2023-11-05', 'ABC-123').ticket;
        const allTickets = [ticket1];
        cancelarTicketCarga(ticket1.numeroTicket, allTickets); 
        expect(ticket1.status).toBe(TICKET_STATUS.CANCELADO); 
        const resultadoCancelacion = cancelarTicketCarga(ticket1.numeroTicket, allTickets);

        expect(resultadoCancelacion.success).toBe(true);
        expect(resultadoCancelacion.message).toBe(`Ticket #${ticket1.numeroTicket} cancelado exitosamente.`); 
        expect(resultadoCancelacion.failedAttempt).toBeUndefined();

        expect(ticket1.status).toBe(TICKET_STATUS.CANCELADO);
    });


    it('debe retornar un mensaje de error y retornar intento fallido si el ticket es "Completado"', () => {
        const ticket1 = generarTicketCarga('Surtidor 1', 'Gasolina 95', 50, '2023-11-05', 'ABC-123').ticket;
        ticket1.status = TICKET_STATUS.COMPLETADO;
        const allTickets = [ticket1];

        
        const resultadoCancelacion = cancelarTicketCarga(ticket1.numeroTicket, allTickets);

        expect(resultadoCancelacion.success).toBe(false);
        expect(resultadoCancelacion.message).toBe("Error: No es posible cancelar este ticket - verifique el estado o número de folio");
        expect(resultadoCancelacion.failedAttempt).toBeDefined();
        expect(resultadoCancelacion.failedAttempt.ticketNumber).toBe(ticket1.numeroTicket);
        expect(resultadoCancelacion.failedAttempt.reason).toBe(`Ticket en estado "${TICKET_STATUS.COMPLETADO}".`);
        expect(resultadoCancelacion.failedAttempt.timestamp).toBeDefined(); 

        expect(ticket1.status).toBe(TICKET_STATUS.COMPLETADO);
    });

    it('debe retornar un mensaje de error y retornar intento fallido si el ticket no existe', () => {
        const allTickets = [
             generarTicketCarga('Surtidor 1', 'Gasolina 95', 50, '2023-11-05', 'ABC-123').ticket
        ]; 

        const nonExistentTicketNumber = 999; 

        const resultadoCancelacion = cancelarTicketCarga(nonExistentTicketNumber, allTickets);

        expect(resultadoCancelacion.success).toBe(false);
        expect(resultadoCancelacion.message).toBe("Error: No es posible cancelar este ticket - verifique el estado o número de folio");
         expect(resultadoCancelacion.failedAttempt).toBeDefined(); 
        expect(resultadoCancelacion.failedAttempt.ticketNumber).toBe(nonExistentTicketNumber);
        expect(resultadoCancelacion.failedAttempt.reason).toBe("Ticket inexistente.");
         expect(resultadoCancelacion.failedAttempt.timestamp).toBeDefined(); 

        expect(allTickets[0].status).toBe(TICKET_STATUS.GENERADO);
    });

      it('debe retornar un mensaje de error y retornar intento fallido si el número de ticket no es válido (NaN)', () => {
        const allTickets = [
             generarTicketCarga('Surtidor 1', 'Gasolina 95', 50, '2023-11-05', 'ABC-123').ticket
        ];

        const resultadoCancelacion = cancelarTicketCarga('abc', allTickets);

        expect(resultadoCancelacion.success).toBe(false);
        expect(resultadoCancelacion.message).toBe("Error: No es posible cancelar este ticket - verifique el estado o número de folio");
        expect(resultadoCancelacion.failedAttempt).toBeDefined();
        expect(resultadoCancelacion.failedAttempt.ticketNumber).toBe('abc'); 
        expect(resultadoCancelacion.failedAttempt.reason).toBe("Ticket inexistente.");
        expect(resultadoCancelacion.failedAttempt.timestamp).toBeDefined();

        expect(allTickets[0].status).toBe(TICKET_STATUS.GENERADO);
    });
});

describe('Notificación de ticket cuando se acerca el turno', () => {

    it('debe notificar si el ticket está a 3 turnos de ser atendido y no ha sido notificado', () => {
        const ticket = {
            numeroTicket: 105,
            surtidorNombre: 'Surtidor 1', 
            tipoCombustible: 'Gasolina Especial',
            cantidad: 40,
            placa: 'ZXC-123',
            status: TICKET_STATUS.GENERADO, 
            notificado: false
        };

        const colaTurno = [
           { numeroTicket: 101, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' }, 
           { numeroTicket: 102, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' }, 
           { numeroTicket: 103, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' }, 
           ticket,
           { numeroTicket: 106, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' } 
        ];

        const resultado = verificarTurnoTicket(ticket.numeroTicket, 'Surtidor 1', colaTurno);

        expect(resultado.notificar).toBe(true);
        expect(resultado.message).toBe('¡Tu turno se acerca! Ticket #105');
    });

    it('no debe notificar si el ticket ya fue notificado', () => {
        const ticket = {
            numeroTicket: 105,
            surtidorNombre: 'Surtidor 1', 
            tipoCombustible: 'Gasolina Especial',
            cantidad: 40,
            placa: 'ZXC-123',
            status: TICKET_STATUS.GENERADO, 
            notificado: true
        };

        const colaTurno = [
           { numeroTicket: 101, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' },
           { numeroTicket: 102, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' }, 
           { numeroTicket: 103, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' }, 
           ticket,
           { numeroTicket: 106, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' } 
        ];

        const resultado = verificarTurnoTicket(ticket.numeroTicket, 'Surtidor 1', colaTurno);

        expect(resultado.notificar).toBe(false);
        expect(resultado.message).toBe('');
    });

    it('no debe notificar si el ticket no está exactamente a 3 turnos de distancia', () => {
        const ticket = {
            numeroTicket: 105,
            surtidorNombre: 'Surtidor 1', 
            tipoCombustible: 'Gasolina Especial',
            cantidad: 40,
            placa: 'ZXC-123',
            status: TICKET_STATUS.GENERADO, 
            notificado: false
        };

        const colaTurno = [
             { numeroTicket: 101, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' }, 
             ticket,
             { numeroTicket: 102, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' }, 
             { numeroTicket: 103, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' } 
          ];

        const resultado = verificarTurnoTicket(ticket.numeroTicket, 'Surtidor 1', colaTurno);

        expect(resultado.notificar).toBe(false);
    });

    it('no debe notificar si el ticket está cancelado', () => {
        const ticket = {
            numeroTicket: 105,
            surtidorNombre: 'Surtidor 1', 
            tipoCombustible: 'Gasolina Especial',
            cantidad: 40,
            placa: 'ZXC-123',
            status: TICKET_STATUS.CANCELADO, 
            notificado: false
        };

        const colaTurno = [
           { numeroTicket: 101, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' }, 
           { numeroTicket: 102, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' }, 
           { numeroTicket: 103, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' }, 
           ticket,
           { numeroTicket: 106, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' } 
        ];

        const resultado = verificarTurnoTicket(ticket.numeroTicket, 'Surtidor 1', colaTurno);

        expect(resultado.notificar).toBe(false);
        expect(resultado.message).toBe('');
    });

    it('no debe notificar si el ticket fue completado', () => {
        const ticket = {
            numeroTicket: 105,
            surtidorNombre: 'Surtidor 1', 
            tipoCombustible: 'Gasolina Especial',
            cantidad: 40,
            placa: 'ZXC-123',
            status: TICKET_STATUS.COMPLETADO, 
            notificado: false
        };

        const colaTurno = [
           { numeroTicket: 101, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' }, 
           { numeroTicket: 102, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' }, 
           { numeroTicket: 103, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' }, 
           ticket,
           { numeroTicket: 106, status: TICKET_STATUS.GENERADO, surtidorNombre: 'Surtidor 1' } 
        ];

        const resultado = verificarTurnoTicket(ticket.numeroTicket, 'Surtidor 1', colaTurno);

        expect(resultado.notificar).toBe(false);
        expect(resultado.message).toBe('');
    });
});