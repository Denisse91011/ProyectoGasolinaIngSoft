import { generarTicketCarga, resetTicketCounter } from '../usuario.js'; 

describe('Generación de Ticket de Carga (Usuario)', () => {

    beforeEach(() => {
        resetTicketCounter();
    });

    it('debe generar un ticket exitosamente con datos válidos', () => {
        const tipo = 'Gasolina 95';
        const cantidad = 150.75;
        const fecha = '2023-11-01';
        const placa = 'XYZ-789';

        const resultado = generarTicketCarga(tipo, cantidad, fecha, placa);

        expect(resultado.success).toBe(true);
        expect(resultado.ticket).toBeDefined();

        expect(resultado.ticket.numeroTicket).toBe(1); 
        expect(resultado.ticket.tipoCombustible).toBe(tipo);
        expect(resultado.ticket.cantidadCargada).toBe(cantidad);
        expect(resultado.ticket.fechaHora).toContain(fecha);
        expect(resultado.ticket.fechaHora).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
        expect(resultado.ticket.placaVehiculo).toBe(placa);
    });

    it('debe generar IDs únicos para tickets consecutivos', () => {
        const tipo = 'Diesel';
        const cantidad = 300;
        const fecha = '2023-11-02';
        const placa1 = 'ABC-111';
        const placa2 = 'DEF-222';

        const resultado1 = generarTicketCarga(tipo, cantidad, fecha, placa1);
        const resultado2 = generarTicketCarga(tipo, cantidad, fecha, placa2);

        expect(resultado1.success).toBe(true);
        expect(resultado2.success).toBe(true);

        expect(resultado1.ticket.numeroTicket).toBe(1);
        expect(resultado2.ticket.numeroTicket).toBe(2);
    });

    it('debe retornar un mensaje de error si la cantidad es cero o negativa', () => {
        const tipo = 'Gasolina 95';
        const fecha = '2023-11-01';
        const placa = 'ABC-123';

        let resultado = generarTicketCarga(tipo, 0, fecha, placa);
        expect(resultado.success).toBe(false);
        expect(resultado.message).toBe("Cantidad inválida: debe ingresar un valor positivo");
        expect(resultado.ticket).toBeUndefined(); 

        resultado = generarTicketCarga(tipo, -50, fecha, placa);
        expect(resultado.success).toBe(false);
        expect(resultado.message).toBe("Cantidad inválida: debe ingresar un valor positivo");
        expect(resultado.ticket).toBeUndefined();

        resultado = generarTicketCarga(tipo, 'cien', fecha, placa);
        expect(resultado.success).toBe(false);
        expect(resultado.message).toBe("Cantidad inválida: debe ingresar un valor positivo");
        expect(resultado.ticket).toBeUndefined();
    });

     it('debe retornar un mensaje de error si falta el tipo de combustible', () => {
         const cantidad = 100;
         const fecha = '2023-11-01';
         const placa = 'ABC-123';

         let resultado = generarTicketCarga('', cantidad, fecha, placa);
         expect(resultado.success).toBe(false);
         expect(resultado.message).toBe("Por favor, complete todos los campos requeridos (tipo, cantidad, fecha, placa).");
         expect(resultado.ticket).toBeUndefined();
     });

      it('debe retornar un mensaje de error si falta la fecha', () => {
         const tipo = 'Gasolina 95';
         const cantidad = 100;
         const placa = 'ABC-123';

         let resultado = generarTicketCarga(tipo, cantidad, '', placa);
         expect(resultado.success).toBe(false);
         expect(resultado.message).toBe("Por favor, complete todos los campos requeridos (tipo, cantidad, fecha, placa).");
         expect(resultado.ticket).toBeUndefined();
     });

      it('debe retornar un mensaje de error si falta la placa', () => {
         const tipo = 'Gasolina 95';
         const cantidad = 100;
         const fecha = '2023-11-01';

         let resultado = generarTicketCarga(tipo, cantidad, fecha, '');
         expect(resultado.success).toBe(false);
         expect(resultado.message).toBe("Por favor, complete todos los campos requeridos (tipo, cantidad, fecha, placa).");
         expect(resultado.ticket).toBeUndefined();
     });
});