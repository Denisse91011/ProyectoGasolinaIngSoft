import { Usuario } from '../usuario.js'; 

describe('Gestión de Tickets (Clase Usuario)', () => {

    beforeEach(() => {
        Usuario.resetTicketCounter(); 
    });

    describe('Generación de Ticket', () => {
        it('debe generar un ticket exitosamente con datos válidos', () => {
            const surtidor = 'Surtidor 1';
            const tipo = 'Gasolina 95';
            const cantidad = 150.75;
            const fecha = '2023-11-01';
            const placa = 'XYZ-789';

            const resultado = Usuario.generarTicketCarga(surtidor, tipo, cantidad, fecha, placa);

            expect(resultado.success).toBe(true);
            expect(resultado.ticket).toBeDefined();
            expect(resultado.ticket.numeroTicket).toBe(1);
            expect(resultado.ticket.surtidorNombre).toBe(surtidor);
            expect(resultado.ticket.tipoCombustible).toBe(tipo);
            expect(resultado.ticket.cantidadCargada).toBe(cantidad);
            expect(resultado.ticket.fechaHora).toContain(fecha);
            expect(resultado.ticket.fechaHora).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
            expect(resultado.ticket.placaVehiculo).toBe(placa);
            expect(resultado.ticket.status).toBe(Usuario.TICKET_STATUS.GENERADO); 
            expect(resultado.ticket.notificado).toBe(false); 
        });

        it('debe generar IDs únicos para tickets consecutivos', () => {
            const surtidor = 'Surtidor A';
            const tipo = 'Diesel';
            const cantidad = 300;
            const fecha = '2023-11-02';
            const placa1 = 'ABC-111';
            const placa2 = 'DEF-222';

            const resultado1 = Usuario.generarTicketCarga(surtidor, tipo, cantidad, fecha, placa1);
            const resultado2 = Usuario.generarTicketCarga(surtidor, tipo, cantidad, fecha, placa2);

            expect(resultado1.success).toBe(true);
            expect(resultado2.success).toBe(true);
            expect(resultado1.ticket.numeroTicket).toBe(1);
            expect(resultado2.ticket.numeroTicket).toBe(2);
            expect(resultado1.ticket.status).toBe(Usuario.TICKET_STATUS.GENERADO);
            expect(resultado2.ticket.status).toBe(Usuario.TICKET_STATUS.GENERADO);
        });

        it('debe retornar un mensaje de error si la cantidad es cero, negativa o no numérica al generar', () => {
            const surtidor = 'Surtidor 1';
            const tipo = 'Gasolina 95';
            const fecha = '2023-11-01';
            const placa = 'ABC-123';

            let resultado = Usuario.generarTicketCarga(surtidor, tipo, 0, fecha, placa);
            expect(resultado.success).toBe(false);
            expect(resultado.message).toBe("Cantidad inválida: debe ingresar un valor positivo");
            expect(resultado.ticket).toBeUndefined();

            resultado = Usuario.generarTicketCarga(surtidor, tipo, -50, fecha, placa);
            expect(resultado.success).toBe(false);
            expect(resultado.message).toBe("Cantidad inválida: debe ingresar un valor positivo");
            expect(resultado.ticket).toBeUndefined();

            resultado = Usuario.generarTicketCarga(surtidor, tipo, 'cien', fecha, placa);
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
            const expectedMessage = "Por favor, complete todos los campos requeridos (surtidor, tipo, cantidad, fecha, placa).";

            let resultado = Usuario.generarTicketCarga('', tipo, cantidad, fecha, placa);
            expect(resultado.success).toBe(false);
            expect(resultado.message).toBe(expectedMessage);

            resultado = Usuario.generarTicketCarga(surtidor, '', cantidad, fecha, placa);
            expect(resultado.success).toBe(false);
            expect(resultado.message).toBe(expectedMessage);

            resultado = Usuario.generarTicketCarga(surtidor, tipo, cantidad, '', placa);
            expect(resultado.success).toBe(false);
            expect(resultado.message).toBe(expectedMessage);

            resultado = Usuario.generarTicketCarga(surtidor, tipo, cantidad, fecha, '');
            expect(resultado.success).toBe(false);
            expect(resultado.message).toBe(expectedMessage);
        });
    });

    describe('Cancelación de Ticket', () => {
        it('debe cancelar un ticket con estado "Generado" exitosamente', () => {
            const ticket1 = Usuario.generarTicketCarga('Surtidor 1', 'Gasolina 95', 50, '2023-11-05', 'ABC-123').ticket;
            const ticket2 = Usuario.generarTicketCarga('Surtidor 2', 'Diesel', 100, '2023-11-05', 'DEF-456').ticket;
            const allTickets = [ticket1, ticket2];

            expect(ticket1.status).toBe(Usuario.TICKET_STATUS.GENERADO);

            const resultadoCancelacion = Usuario.cancelarTicketCarga(ticket1.numeroTicket, allTickets);

            expect(resultadoCancelacion.success).toBe(true);
            expect(resultadoCancelacion.message).toBe(`Ticket #${ticket1.numeroTicket} cancelado exitosamente.`);
            expect(resultadoCancelacion.failedAttempt).toBeUndefined();
            expect(ticket1.status).toBe(Usuario.TICKET_STATUS.CANCELADO);
            expect(ticket2.status).toBe(Usuario.TICKET_STATUS.GENERADO); 
        });

        it('debe retornar error si se intenta cancelar un ticket ya "Cancelado"', () => {
            const ticket1 = Usuario.generarTicketCarga('Surtidor 1', 'Gasolina 95', 50, '2023-11-05', 'ABC-123').ticket;
            const allTickets = [ticket1];
            Usuario.cancelarTicketCarga(ticket1.numeroTicket, allTickets); 
            expect(ticket1.status).toBe(Usuario.TICKET_STATUS.CANCELADO);

            const resultadoCancelacion = Usuario.cancelarTicketCarga(ticket1.numeroTicket, allTickets); 

            expect(resultadoCancelacion.success).toBe(false); 
            expect(resultadoCancelacion.message).toBe(`Error: El ticket #${ticket1.numeroTicket} ya se encuentra cancelado.`);
            expect(resultadoCancelacion.failedAttempt).toBeDefined();
            expect(resultadoCancelacion.failedAttempt.reason).toBe(`Ticket ya está en estado "${Usuario.TICKET_STATUS.CANCELADO}".`);
            expect(ticket1.status).toBe(Usuario.TICKET_STATUS.CANCELADO);
        });


        it('debe retornar error e intento fallido si el ticket es "Completado"', () => {
            const ticket1 = Usuario.generarTicketCarga('Surtidor 1', 'Gasolina 95', 50, '2023-11-05', 'ABC-123').ticket;
            ticket1.status = Usuario.TICKET_STATUS.COMPLETADO; 
            const allTickets = [ticket1];

            const resultadoCancelacion = Usuario.cancelarTicketCarga(ticket1.numeroTicket, allTickets);

            expect(resultadoCancelacion.success).toBe(false);
            expect(resultadoCancelacion.message).toBe("Error: No es posible cancelar este ticket - verifique el estado o número de folio");
            expect(resultadoCancelacion.failedAttempt).toBeDefined();
            expect(resultadoCancelacion.failedAttempt.ticketNumber).toBe(ticket1.numeroTicket);
            expect(resultadoCancelacion.failedAttempt.reason).toBe(`Ticket en estado "${Usuario.TICKET_STATUS.COMPLETADO}".`);
            expect(resultadoCancelacion.failedAttempt.timestamp).toBeDefined();
            expect(ticket1.status).toBe(Usuario.TICKET_STATUS.COMPLETADO); 
        });

        it('debe retornar error e intento fallido si el ticket no existe', () => {
            const allTickets = [
                Usuario.generarTicketCarga('Surtidor 1', 'Gasolina 95', 50, '2023-11-05', 'ABC-123').ticket
            ];
            const nonExistentTicketNumber = 999;

            const resultadoCancelacion = Usuario.cancelarTicketCarga(nonExistentTicketNumber, allTickets);

            expect(resultadoCancelacion.success).toBe(false);
            expect(resultadoCancelacion.message).toBe("Error: No es posible cancelar este ticket - verifique el estado o número de folio");
            expect(resultadoCancelacion.failedAttempt).toBeDefined();
            expect(resultadoCancelacion.failedAttempt.ticketNumber).toBe(nonExistentTicketNumber);
            expect(resultadoCancelacion.failedAttempt.reason).toBe("Ticket inexistente.");
            expect(resultadoCancelacion.failedAttempt.timestamp).toBeDefined();
            expect(allTickets[0].status).toBe(Usuario.TICKET_STATUS.GENERADO); 
        });

        it('debe retornar error e intento fallido si el número de ticket no es válido (NaN) al cancelar', () => {
            const allTickets = [
                Usuario.generarTicketCarga('Surtidor 1', 'Gasolina 95', 50, '2023-11-05', 'ABC-123').ticket
            ];

            const resultadoCancelacion = Usuario.cancelarTicketCarga('abc', allTickets);

            expect(resultadoCancelacion.success).toBe(false);
            expect(resultadoCancelacion.message).toBe("Error: No es posible cancelar este ticket - verifique el estado o número de folio");
            expect(resultadoCancelacion.failedAttempt).toBeDefined();
            expect(resultadoCancelacion.failedAttempt.ticketNumber).toBe('abc');
            expect(resultadoCancelacion.failedAttempt.reason).toBe("Ticket inexistente.");
            expect(resultadoCancelacion.failedAttempt.timestamp).toBeDefined();
            expect(allTickets[0].status).toBe(Usuario.TICKET_STATUS.GENERADO);
        });
    });

    describe('Verificación de Turno y Notificación', () => {
        const crearTicketPrueba = (numero, surtidor, status = Usuario.TICKET_STATUS.GENERADO, notificado = false) => ({
            numeroTicket: numero,
            surtidorNombre: surtidor,
            tipoCombustible: 'Gasolina Test',
            cantidadCargada: 10, 
            fechaHora: '2023-01-01 10:00',
            placaVehiculo: `TST-${numero}`,
            status: status,
            notificado: notificado
        });

        it('debe notificar si el ticket es el 4to en la cola (índice 3) y no ha sido notificado', () => {
           
            const surtidor = 'Surtidor Notif';
            const ticketObjetivo = crearTicketPrueba(104, surtidor);
            const colaTurno = [
                crearTicketPrueba(101, surtidor),
                crearTicketPrueba(102, surtidor),
                crearTicketPrueba(103, surtidor),
                ticketObjetivo,
                crearTicketPrueba(105, surtidor)
            ];

            const resultado = Usuario.verificarTurnoTicket(ticketObjetivo.numeroTicket, surtidor, colaTurno);

            expect(resultado.notificar).toBe(true);
            expect(resultado.message).toBe(`¡Tu turno se acerca! Ticket #${ticketObjetivo.numeroTicket}. Estás en la posición 4.`);
            expect(resultado.currentPosition).toBe(4);
            expect(resultado.totalWaiting).toBe(5); 
            expect(ticketObjetivo.notificado).toBe(true); 
            expect(resultado.ticketStatus).toBe(Usuario.TICKET_STATUS.GENERADO);
        });

        it('debe notificar si el ticket es el primero en la cola y no ha sido notificado', () => {
            const surtidor = 'Surtidor Notif';
            const ticketObjetivo = crearTicketPrueba(101, surtidor);
            const colaTurno = [
                ticketObjetivo,
                crearTicketPrueba(102, surtidor),
                crearTicketPrueba(103, surtidor),
                crearTicketPrueba(104, surtidor)
            ];

            const resultado = Usuario.verificarTurnoTicket(ticketObjetivo.numeroTicket, surtidor, colaTurno);

            expect(resultado.notificar).toBe(true);
            expect(resultado.message).toBe(`¡Tu turno se acerca! Ticket #${ticketObjetivo.numeroTicket}. Estás en la posición 1.`);
            expect(resultado.currentPosition).toBe(1);
            expect(resultado.totalWaiting).toBe(4);
            expect(ticketObjetivo.notificado).toBe(true);
            expect(resultado.ticketStatus).toBe(Usuario.TICKET_STATUS.GENERADO);
        });


        it('no debe notificar si el ticket ya fue notificado, aunque esté en posición de notificación', () => {
            const surtidor = 'Surtidor Notif';
            const ticketObjetivo = crearTicketPrueba(101, surtidor, Usuario.TICKET_STATUS.GENERADO, true);
            const colaTurno = [
                ticketObjetivo,
                crearTicketPrueba(102, surtidor),
            ];

            const resultado = Usuario.verificarTurnoTicket(ticketObjetivo.numeroTicket, surtidor, colaTurno);

            expect(resultado.notificar).toBe(false);
            expect(resultado.message).toBe(`Ticket #${ticketObjetivo.numeroTicket} ya fue notificado previamente.`);
            expect(resultado.currentPosition).toBe(1);
            expect(resultado.totalWaiting).toBe(2);
            expect(resultado.ticketStatus).toBe(Usuario.TICKET_STATUS.GENERADO);
        });

        it('no debe notificar si el ticket está más allá de la 4ta posición (ej. 5to)', () => {
            const surtidor = 'Surtidor Notif';
            const ticketObjetivo = crearTicketPrueba(105, surtidor);
            const colaTurno = [
                crearTicketPrueba(101, surtidor),
                crearTicketPrueba(102, surtidor),
                crearTicketPrueba(103, surtidor),
                crearTicketPrueba(104, surtidor),
                ticketObjetivo,
                crearTicketPrueba(106, surtidor)
            ];

            const resultado = Usuario.verificarTurnoTicket(ticketObjetivo.numeroTicket, surtidor, colaTurno);

            expect(resultado.notificar).toBe(false);
            expect(resultado.message).toBe(''); 
            expect(resultado.currentPosition).toBe(5);
            expect(resultado.totalWaiting).toBe(6);
            expect(ticketObjetivo.notificado).toBe(false); 
            expect(resultado.ticketStatus).toBe(Usuario.TICKET_STATUS.GENERADO);
        });

        it('no debe notificar si el ticket está cancelado', () => {
            const surtidor = 'Surtidor Notif';
            const ticketObjetivo = crearTicketPrueba(101, surtidor, Usuario.TICKET_STATUS.CANCELADO);
            const colaTurno = [
                ticketObjetivo, 
                crearTicketPrueba(102, surtidor),
            ];

            const resultado = Usuario.verificarTurnoTicket(ticketObjetivo.numeroTicket, surtidor, colaTurno);

            expect(resultado.notificar).toBe(false);
            expect(resultado.message).toBe('');
            expect(resultado.currentPosition).toBe(-1); 
            expect(resultado.totalWaiting).toBe(1); 
            expect(resultado.ticketStatus).toBe(Usuario.TICKET_STATUS.CANCELADO);
        });

        it('no debe notificar si el ticket fue completado', () => {
            const surtidor = 'Surtidor Notif';
            const ticketObjetivo = crearTicketPrueba(101, surtidor, Usuario.TICKET_STATUS.COMPLETADO);
            const colaTurno = [
                ticketObjetivo,
                crearTicketPrueba(102, surtidor),
            ];

            const resultado = Usuario.verificarTurnoTicket(ticketObjetivo.numeroTicket, surtidor, colaTurno);

            expect(resultado.notificar).toBe(false);
            expect(resultado.message).toBe('');
            expect(resultado.currentPosition).toBe(-1);
            expect(resultado.totalWaiting).toBe(1);
            expect(resultado.ticketStatus).toBe(Usuario.TICKET_STATUS.COMPLETADO);
        });

        it('debe devolver datos correctos si el ticket no se encuentra en la lista para ese surtidor', () => {
            const surtidor = 'Surtidor Notif';
            const colaTurno = [
                crearTicketPrueba(101, surtidor),
                crearTicketPrueba(102, 'Otro Surtidor'), 
            ];
            const numeroTicketNoExistente = 999;

            const resultado = Usuario.verificarTurnoTicket(numeroTicketNoExistente, surtidor, colaTurno);

            expect(resultado.notificar).toBe(false);
            expect(resultado.message).toBe('');
            expect(resultado.currentPosition).toBe(-1);
            expect(resultado.totalWaiting).toBe(0); 
            expect(resultado.ticketStatus).toBe(null);
        });

         it('debe manejar correctamente una cola vacía', () => {
            const surtidor = 'Surtidor Vacío';
            const colaTurno = [];
            const numeroTicketCualquiera = 1;

            const resultado = Usuario.verificarTurnoTicket(numeroTicketCualquiera, surtidor, colaTurno);
            expect(resultado.notificar).toBe(false);
            expect(resultado.message).toBe('');
            expect(resultado.currentPosition).toBe(-1);
            expect(resultado.totalWaiting).toBe(0);
            expect(resultado.ticketStatus).toBe(null);
        });

        it('debe retornar la posición correcta y el total en espera para un ticket en cola pero no en posición de notificar', () => {
            const surtidor = 'Surtidor Notif';
            const ticketObjetivo = crearTicketPrueba(105, surtidor);
            const colaTurno = [
                crearTicketPrueba(101, surtidor),
                crearTicketPrueba(102, surtidor),
                crearTicketPrueba(103, surtidor),
                crearTicketPrueba(104, surtidor),
                ticketObjetivo, // 5to
                crearTicketPrueba(106, surtidor),
                crearTicketPrueba(107, surtidor, Usuario.TICKET_STATUS.CANCELADO) 
            ];

            const resultado = Usuario.verificarTurnoTicket(ticketObjetivo.numeroTicket, surtidor, colaTurno);

            expect(resultado.notificar).toBe(false);
            expect(resultado.message).toBe('');
            expect(resultado.currentPosition).toBe(5);
            expect(resultado.totalWaiting).toBe(6); 
            expect(ticketObjetivo.notificado).toBe(false);
            expect(resultado.ticketStatus).toBe(Usuario.TICKET_STATUS.GENERADO);
        });
    });
});