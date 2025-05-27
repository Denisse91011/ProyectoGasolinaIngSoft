describe('Gestión de Tickets de Carga via UI (Usuario)', () => {

    beforeEach(() => {
        cy.visit('index.html');

        cy.get('#nombre-surtidor').type('Surtidor Pruebas UI');
        cy.get('#tipo-surtidor').type('Gasolina Pruebas');
        cy.get('#surtidor-form').submit(); 
        
        cy.on('window:alert', (str) => {
            expect(str).to.equal('Surtidor "Surtidor Pruebas UI" de tipo "Gasolina Pruebas" agregado correctamente.');
        });
        
        cy.get('#reporte-surtidores').should('contain.text', 'Surtidor Pruebas UI');
    });


    it('debe generar un ticket exitosamente con datos válidos a través del formulario', () => {
        const cantidad = '75.50'; 
        const fecha = '2023-12-15'; 
        const placa = 'XYZ-987';
        const surtidorNombre = 'Surtidor Pruebas UI'; 

        cy.get('#select-surtidor-ticket').select(surtidorNombre);

        cy.get('#ticket-cantidad').type(cantidad);
        cy.get('#ticket-fecha').type(fecha);
        cy.get('#ticket-placa').type(placa);

        cy.get('#ticket-form').submit(); 

        cy.get('#ticket-resultado')
            .should('be.visible') 
            .and('have.class', 'valid') 
            .and('contain.text', 'Ticket #1');

        cy.get('#ticket-resultado')
            .should('contain.text', `Surtidor: ${surtidorNombre}`)
            .and('contain.text', `Placa: ${placa}`);

        cy.get('#ticket-resultado .ticket-status')
            .should('have.class', 'status-Generado') 
            .and('contain.text', 'Generado'); 

        cy.get('#ticket-history .ticket-entry').should('have.length', 1); 
        cy.get('#ticket-history .ticket-entry').first() 
             .should('contain.text', 'Ticket #1')
             .and('contain.text', surtidorNombre)
             .and('contain.text', placa)
             .find('.ticket-status')
             .should('have.class', 'status-Generado');
    });

    it('debe mostrar un mensaje de error al generar un ticket con cantidad inválida a través del formulario', () => {
         const surtidorNombre = 'Surtidor Pruebas UI';
         const fecha = '2023-12-16';
         const placa = 'QWE-111';

         cy.get('#select-surtidor-ticket').select(surtidorNombre);

         cy.get('#ticket-cantidad').type('0');
         cy.get('#ticket-fecha').type(fecha);
         cy.get('#ticket-placa').type(placa);
         cy.get('#ticket-form').submit(); 

         cy.get('#ticket-resultado')
             .should('be.visible')
             .and('have.class', 'invalid') 
             .and('contain.text', 'Error: Cantidad inválida: debe ingresar un valor positivo'); 

         cy.visit('index.html'); 
         cy.get('#nombre-surtidor').type('Surtidor Pruebas UI');
         cy.get('#tipo-surtidor').type('Gasolina Pruebas');
         cy.get('#surtidor-form').submit(); 
         cy.on('window:alert', (str) => { 
             expect(str).to.equal('Surtidor "Surtidor Pruebas UI" de tipo "Gasolina Pruebas" agregado correctamente.');
         });
         cy.get('#reporte-surtidores').should('contain.text', 'Surtidor Pruebas UI'); 

         cy.get('#select-surtidor-ticket').select(surtidorNombre);
         cy.get('#ticket-cantidad').type('-50');
         cy.get('#ticket-fecha').type(fecha);
         cy.get('#ticket-placa').type(placa);
         cy.get('#ticket-form').submit();

         cy.get('#ticket-resultado')
             .should('be.visible')
             .and('have.class', 'invalid')
             .and('contain.text', 'Error: Cantidad inválida: debe ingresar un valor positivo');

          cy.visit('index.html');
          cy.get('#nombre-surtidor').type('Surtidor Pruebas UI');
          cy.get('#tipo-surtidor').type('Gasolina Pruebas');
          cy.get('#surtidor-form').submit();
          cy.on('window:alert', (str) => {
             expect(str).to.equal('Surtidor "Surtidor Pruebas UI" de tipo "Gasolina Pruebas" agregado correctamente.');
          });
          cy.get('#reporte-surtidores').should('contain.text', 'Surtidor Pruebas UI'); 

          cy.get('#select-surtidor-ticket').select(surtidorNombre);
          cy.get('#ticket-cantidad').type('cien'); 
          cy.get('#ticket-fecha').type(fecha);
          cy.get('#ticket-placa').type(placa);
          cy.get('#ticket-form').submit(); 
          cy.get('#ticket-resultado')
              .should('be.visible')
              .and('have.class', 'invalid')
              .and('contain.text', 'Error: Cantidad inválida: debe ingresar un valor positivo');

         cy.get('#ticket-history').should('contain.text', 'No se han generado tickets aún.'); 
         cy.get('#ticket-history .ticket-entry').should('not.exist');

    });

     it('debe mostrar un mensaje de error si faltan campos requeridos al generar un ticket a través del formulario', () => {
        const surtidorNombre = 'Surtidor Pruebas UI';
        const cantidad = '100';
        const fecha = '2023-12-19';
        const placa = 'ASD-222';

        cy.get('#select-surtidor-ticket').select(surtidorNombre);

        cy.get('#ticket-cantidad').type(cantidad);
        cy.get('#ticket-fecha').type(fecha);
        cy.get('#ticket-placa').clear(); 

        cy.get('#ticket-form').submit();

        cy.get('#ticket-resultado')
            .should('be.visible')
            .and('have.class', 'invalid')
            .and('contain.text', 'Error: Por favor, complete todos los campos requeridos (surtidor, tipo, cantidad, fecha, placa).');

        cy.get('#ticket-history .ticket-entry').should('not.exist');
    });

    it('debe notificar si el ticket está a 3 turnos de ser atendido a través de la UI', () => {
        const surtidorNombre = 'Surtidor Pruebas UI';
        const baseDate = '2024-01-01'; 

        cy.get('#select-surtidor-ticket').select(surtidorNombre);
        cy.get('#ticket-cantidad').type('10');
        cy.get('#ticket-fecha').type(baseDate);
        cy.get('#ticket-placa').type('ABC-001');
        cy.get('#ticket-form input[type="submit"]').click(); 
        cy.get('#ticket-resultado').should('contain.text', 'Ticket #1'); 

        cy.get('#select-surtidor-ticket').select(surtidorNombre);
        cy.get('#ticket-cantidad').type('20');
        cy.get('#ticket-fecha').type(baseDate);
        cy.get('#ticket-placa').type('ABC-002');
        cy.get('#ticket-form input[type="submit"]').click(); 
        cy.get('#ticket-resultado').should('contain.text', 'Ticket #2');

        cy.get('#select-surtidor-ticket').select(surtidorNombre);
        cy.get('#ticket-cantidad').type('30');
        cy.get('#ticket-fecha').type(baseDate);
        cy.get('#ticket-placa').type('ABC-003');
        cy.get('#ticket-form input[type="submit"]').click(); 
        cy.get('#ticket-resultado').should('contain.text', 'Ticket #3');

        const targetTicketNumber = 4; 
        cy.get('#select-surtidor-ticket').select(surtidorNombre);
        cy.get('#ticket-cantidad').type('40');
        cy.get('#ticket-fecha').type(baseDate);
        cy.get('#ticket-placa').type('XYZ-TARGET');
        cy.get('#ticket-form input[type="submit"]').click(); 
        cy.get('#ticket-resultado').should('contain.text', `Ticket #${targetTicketNumber}`); 

        cy.get('#select-surtidor-ticket').select(surtidorNombre);
        cy.get('#ticket-cantidad').type('50');
        cy.get('#ticket-fecha').type(baseDate);
        cy.get('#ticket-placa').type('ABC-005');
        cy.get('#ticket-form input[type="submit"]').click(); 
        cy.get('#ticket-resultado').should('contain.text', 'Ticket #5');

        cy.get('#verificar-numero-ticket').type(targetTicketNumber);
        cy.get('#select-surtidor-turno').select(surtidorNombre);
        cy.get('#verificar-turno-form button[type="submit"]').click(); 

        cy.get('#verificar-turno-message')
            .should('be.visible')
            .and('have.class', 'valid')
            .and('contain.text', `¡Tu turno se acerca! Ticket #${targetTicketNumber}`);

        cy.get('#verificar-turno-result')
            .should('be.visible')
            .and('have.class', 'valid')
            .and('contain.text', `Ticket #${targetTicketNumber}`)
            .and('contain.text', 'Posición en cola: 4 de 5') 
            .and('contain.text', 'Estado: Generado'); 


        cy.get('body').find('.floating-notification')
            .should('be.visible')
            .and('contain.text', `¡Tu turno se acerca! Ticket #${targetTicketNumber}`);

        cy.get('.floating-notification', { timeout: 6000 }).should('not.exist'); 
    });

});