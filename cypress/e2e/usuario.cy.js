// cypress/e2e/usuario.cy.js

describe('Gestión de Tickets de Carga via UI (Usuario)', () => {
    const surtidorNombrePrueba = 'Surtidor Pruebas UI';
    const tipoCombustiblePrueba = 'Gasolina Pruebas';
    let ticketCounterForTest = 1;

    const resetAppTicketCounter = () => {
        cy.window().then((win) => {
            if (win.appResetTicketCounter) {
                win.appResetTicketCounter();
                ticketCounterForTest = 1;
            }
        });
    };

    beforeEach(() => {
        cy.visit('index.html');
        resetAppTicketCounter();

        cy.get('#nombre-surtidor').type(surtidorNombrePrueba);
        cy.get('#tipo-surtidor').type(tipoCombustiblePrueba);
        cy.get('#surtidor-form').submit();
        cy.get('#reporte-surtidores').should('contain.text', surtidorNombrePrueba);

        cy.get('#select-surtidor-ingreso').select(surtidorNombrePrueba);
        cy.get('#cantidad').type('1000');
        cy.get('#fecha').type('2024-01-01');
        cy.get('#Ingreso-form').submit();
        cy.get('#reporte-gasolina').should('contain.text', `Ingreso de 1000 litros registrado correctamente para el surtidor ${surtidorNombrePrueba}.`);
        cy.get('#reporte-surtidores').should('contain.text', 'Stock: 1000.00 l');
    });


    it('debe verificar el turno y mostrar la información correcta (incluida notificación si aplica)', () => {
        const baseDate = '2024-01-01';
        const placas = ['ABC-001', 'ABC-002', 'ABC-003', 'TARGET-004', 'ABC-005'];
        let ticketsGeneradosInfo = [];

        placas.forEach((placa, index) => {
            const ticketNumEsperado = index + 1;
            ticketsGeneradosInfo.push({ numero: ticketNumEsperado, placa: placa });

            cy.get('#select-surtidor-ticket').select(surtidorNombrePrueba);
            cy.get('#ticket-cantidad').clear().type(`${(index + 1) * 10}`);
            cy.get('#ticket-fecha').type(baseDate);
            cy.get('#ticket-placa').clear().type(placa);
            cy.get('#ticket-form').submit();
            cy.get('#ticket-resultado').should('contain.text', `Ticket #${ticketNumEsperado}`);
        });

        cy.get('#ticket-history .ticket-entry').should('have.length', placas.length);

        const targetTicketInfo = ticketsGeneradosInfo.find(t => t.placa === 'TARGET-004');
        expect(targetTicketInfo).to.exist;

        cy.get('#numero-ticket-verificar').type(targetTicketInfo.numero.toString());
        cy.get('#select-surtidor-verificar-turno').select(surtidorNombrePrueba);
        cy.get('#verificar-turno-form button[type="submit"]').click();

        cy.get('#verificar-turno-result')
            .should('be.visible')
            .and('contain.text', `Ticket #${targetTicketInfo.numero}`)
           
            .and('contain.text', `(${surtidorNombrePrueba})`)
            .and('contain.text', 'Estado actual: Generado')
            .and('contain.text', 'Posición en la cola: 4 de 5')
            .and('contain.text', `¡Tu turno se acerca! Ticket #${targetTicketInfo.numero}. Estás en la posición 4.`);

        const ultimoTicketInfo = ticketsGeneradosInfo.find(t => t.placa === 'ABC-005');
        expect(ultimoTicketInfo).to.exist;

        cy.get('#numero-ticket-verificar').clear().type(ultimoTicketInfo.numero.toString());
        cy.get('#verificar-turno-form button[type="submit"]').click();

        cy.get('#verificar-turno-result')
            .should('be.visible')
            .and('contain.text', `Ticket #${ultimoTicketInfo.numero}`)
            .and('contain.text', `(${surtidorNombrePrueba})`)
            .and('contain.text', 'Posición en la cola: 5 de 5')
            .and('not.contain.text', '¡Tu turno se acerca!');
    });

    it('debe generar un ticket exitosamente con datos válidos a través del formulario', () => {
        const cantidad = '75.50';
        const fecha = '2023-12-15';
        const placa = 'XYZ-987';
        const currentTicketNumber = 1;


        cy.get('#select-surtidor-ticket').select(surtidorNombrePrueba);
        cy.get('#ticket-cantidad').type(cantidad);
        cy.get('#ticket-fecha').type(fecha);
        cy.get('#ticket-placa').type(placa);
        cy.get('#ticket-form').submit();

        cy.get('#ticket-resultado')
            .should('be.visible')
            .and('have.class', 'valid')
            .and('contain.text', `Ticket #${currentTicketNumber}`);

       
        cy.get('#ticket-resultado')
            .should('contain.text', `Surtidor: ${surtidorNombrePrueba}`)
            .and('contain.text', `Placa: ${placa}`);

        cy.get('#ticket-resultado .ticket-status')
            .should('have.class', 'status-Generado')
            .and('contain.text', 'Generado');

        cy.get('#ticket-history .ticket-entry').should('have.length', 1);
        cy.get('#ticket-history .ticket-entry').first()
             .should('contain.text', `Ticket #${currentTicketNumber}`)
             .and('contain.text', surtidorNombrePrueba) 
             .and('contain.text', placa)
             .find('.ticket-status')
             .should('have.class', 'status-Generado');
    });

    it('debe mostrar un mensaje de error al generar un ticket con cantidad inválida a través del formulario', () => {
        const fecha = '2023-12-16';
        const placa = 'QWE-111';
        const expectedErrorMessage = 'Error: Cantidad inválida: debe ingresar un valor positivo';

        cy.get('#select-surtidor-ticket').select(surtidorNombrePrueba);
        cy.get('#ticket-cantidad').type('0');
        cy.get('#ticket-fecha').type(fecha);
        cy.get('#ticket-placa').type(placa);
        cy.get('#ticket-form').submit();
        cy.get('#ticket-resultado').should('be.visible').and('have.class', 'invalid').and('contain.text', expectedErrorMessage);
        cy.get('#ticket-history .ticket-entry').should('not.exist');

        cy.get('#ticket-cantidad').clear();
        cy.get('#ticket-placa').clear().type('QWE-222');
        cy.get('#ticket-cantidad').type('-50');
        cy.get('#ticket-form').submit();
        cy.get('#ticket-resultado').should('be.visible').and('have.class', 'invalid').and('contain.text', expectedErrorMessage);
        cy.get('#ticket-history .ticket-entry').should('not.exist');

        cy.get('#ticket-cantidad').clear();
        cy.get('#ticket-placa').clear().type('QWE-333');
        cy.get('#ticket-cantidad').type('cien');
        cy.get('#ticket-form').submit();
        cy.get('#ticket-resultado').should('be.visible').and('have.class', 'invalid').and('contain.text', expectedErrorMessage);
        cy.get('#ticket-history .ticket-entry').should('not.exist');
    });

    it('debe mostrar un mensaje de error si faltan campos requeridos al generar un ticket', () => {
        const cantidad = '100';
        const fecha = '2023-12-19';
        const expectedErrorMessageCamposFaltantes = 'Error: Por favor, complete todos los campos requeridos (surtidor, tipo, cantidad, fecha, placa).';

        cy.get('#select-surtidor-ticket').select(surtidorNombrePrueba);
        cy.get('#ticket-cantidad').type(cantidad);
        cy.get('#ticket-fecha').type(fecha);
        cy.get('#ticket-placa').clear();
        cy.get('#ticket-form').submit();
        cy.get('#ticket-resultado').should('be.visible').and('have.class', 'invalid').and('contain.text', expectedErrorMessageCamposFaltantes);
        cy.get('#ticket-history .ticket-entry').should('not.exist');

        cy.reload();
        resetAppTicketCounter();
        cy.get('#nombre-surtidor').type(surtidorNombrePrueba);
        cy.get('#tipo-surtidor').type(tipoCombustiblePrueba);
        cy.get('#surtidor-form').submit();
        cy.get('#reporte-surtidores').should('contain.text', surtidorNombrePrueba);
        cy.get('#select-surtidor-ingreso').select(surtidorNombrePrueba);
        cy.get('#cantidad').type('1000');
        cy.get('#fecha').type('2024-01-01');
        cy.get('#Ingreso-form').submit();
        cy.get('#reporte-gasolina').should('contain.text', `Ingreso de 1000 litros registrado correctamente para el surtidor ${surtidorNombrePrueba}.`);

        cy.get('#select-surtidor-ticket').should('have.value', '');
        cy.get('#ticket-cantidad').type(cantidad);
        cy.get('#ticket-fecha').type(fecha);
        cy.get('#ticket-placa').type('ANY-000');
        cy.get('#ticket-form').submit();
        cy.get('#ticket-resultado').should('be.visible').and('have.class', 'invalid').and('contain.text', 'Error: Por favor, seleccione un surtidor para generar el ticket.');
    });

    it('debe cancelar un ticket generado a través de la UI', () => {
        const cantidad = '50';
        const fecha = '2024-01-10';
        const placa = 'CANCEL-ME';
        const ticketACancelarNum = 1;

        cy.get('#select-surtidor-ticket').select(surtidorNombrePrueba);
        cy.get('#ticket-cantidad').type(cantidad);
        cy.get('#ticket-fecha').type(fecha);
        cy.get('#ticket-placa').type(placa);
        cy.get('#ticket-form').submit();
        cy.get('#ticket-resultado').should('contain.text', `Ticket #${ticketACancelarNum}`);

        cy.get('#ticket-numero-cancelar').type(ticketACancelarNum.toString());
        cy.get('#cancel-ticket-form').submit();
        cy.get('#cancel-ticket-result').should('be.visible').and('have.class', 'valid').and('contain.text', `Ticket #${ticketACancelarNum} cancelado exitosamente.`);

        cy.get('#ticket-history .ticket-entry').first()
            .should('contain.text', `Ticket #${ticketACancelarNum}`)
            .find('.ticket-status')
            .should('have.class', 'status-Cancelado')
            .and('contain.text', 'Cancelado');
    });

});