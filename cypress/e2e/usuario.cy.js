 <reference types="cypress" />


describe('Gestión de Tickets de Carga via UI (Usuario)', () => {

    beforeEach(() => {
        cy.visit('index.html');

        cy.get('#nombre-surtidor').type('Surtidor Pruebas UI');
        cy.get('#tipo-surtidor').type('Gasolina Pruebas');
        cy.get('#surtidor-form').submit();
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



    it('debe cancelar un ticket con estado "Generado" exitosamente a través del formulario', () => {
        const cantidad = '80';
        const fecha = '2023-12-20';
        const placa = 'FGH-333';
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

         cy.get('#ticket-history .ticket-entry')
             .should('have.length', 1)
             .and('contain.text', 'Ticket #1')
              .find('.ticket-status')
              .should('have.class', 'status-Generado')
              .and('contain.text', 'Generado');


        const numeroTicketACancelar = '1'; 

        cy.get('#ticket-numero-cancelar').type(numeroTicketACancelar);

        cy.get('#cancel-ticket-form').submit();


        cy.get('#cancel-ticket-result')
            .should('be.visible')
            .and('have.class', 'valid') 
            .and('contain.text', `Ticket #${numeroTicketACancelar} cancelado exitosamente.`); 

         cy.get('#ticket-history .ticket-entry')
             .should('have.length', 1) 
             .and('contain.text', 'Ticket #1')
             .find('.ticket-status')
             .should('have.class', 'status-Cancelado') 
             .and('contain.text', 'Cancelado'); 

        cy.get('#failed-cancellation-history').should('contain.text', 'No hay intentos fallidos registrados.');
     });

     it('debe mostrar error y registrar intento fallido al cancelar un ticket inexistente a través del formulario', () => {

         const numeroInexistente = '999'; 

         cy.get('#ticket-numero-cancelar').type(numeroInexistente);

         cy.get('#cancel-ticket-form').submit();

         cy.get('#cancel-ticket-result')
             .should('be.visible')
             .and('have.class', 'invalid') 
             .and('contain.text', 'Error: No es posible cancelar este ticket - verifique el estado o número de folio'); 


         cy.get('#failed-cancellation-history .failed-attempt-entry')
             .should('be.visible') 
             .and('have.length', 1) 
             .and('contain.text', `Ticket #: ${numeroInexistente}`)
             .and('contain.text', 'Razón: Ticket inexistente.');

         cy.get('#ticket-history').should('contain.text', 'No se han generado tickets aún.');

     });

   


});