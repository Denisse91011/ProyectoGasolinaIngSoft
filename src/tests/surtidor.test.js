// src/surtidor.test.js
import { surtidor, CAPACIDAD_MAXIMA } from '../surtidor.js'; 
describe('surtidor', () => {
  let miSurtidor;
  const nombreTest = "Mi Surtidor 1";
  const tipoTest = "Gasolina 95";

  beforeEach(() => {
    miSurtidor = new surtidor(nombreTest, tipoTest);
  });

  it('debe inicializar el surtidor con nombre, tipo, stock 0 e historial vacío', () => {
    expect(miSurtidor.nombre).toBe(nombreTest);
    expect(miSurtidor.tipoCombustible).toBe(tipoTest);
    expect(miSurtidor.stock).toBe(0);
    expect(miSurtidor.historialIngresos).toEqual([]);
  });

  it('agregarSurtidor debe retornar mensaje de éxito si nombre y tipo existen', () => {
    const surtidorCompleto = new surtidor("Surtidor Test", "Diesel");
    expect(surtidorCompleto.agregarSurtidor()).toBe("Surtidor Surtidor Test de tipo Diesel agregado correctamente.");
  });

  it('agregarSurtidor debe retornar mensaje de error si falta nombre', () => {
    const surtidorSinNombre = new surtidor("", "Diesel");
    expect(surtidorSinNombre.agregarSurtidor()).toBe("Por favor, complete todos los campos.");
  });

  it('agregarSurtidor debe retornar mensaje de error si falta tipo', () => {
    const surtidorSinTipo = new surtidor("Surtidor Test", "");
    expect(surtidorSinTipo.agregarSurtidor()).toBe("Por favor, complete todos los campos.");
  });






  it('reportarIngresoGasolina debe aumentar el stock y registrar el historial para cantidad válida', () => {
    const cantidad = 500;
    const fecha = '2023-10-27';
    const resultado = miSurtidor.reportarIngresoGasolina(cantidad, fecha);

    expect(resultado).toBe(`Ingreso de ${cantidad} litros registrado correctamente para el surtidor ${nombreTest}.`);
    expect(miSurtidor.stock).toBe(cantidad);
    expect(miSurtidor.historialIngresos).toEqual([{ cantidad, fecha }]);
  });

  it('reportarIngresoGasolina debe manejar múltiples ingresos', () => {
    const cantidad1 = 300;
    const fecha1 = '2023-10-27';
    const cantidad2 = 200;
    const fecha2 = '2023-10-28';

    miSurtidor.reportarIngresoGasolina(cantidad1, fecha1);
    const resultado2 = miSurtidor.reportarIngresoGasolina(cantidad2, fecha2);

    expect(resultado2).toBe(`Ingreso de ${cantidad2} litros registrado correctamente para el surtidor ${nombreTest}.`);
    expect(miSurtidor.stock).toBe(cantidad1 + cantidad2);
    expect(miSurtidor.historialIngresos).toEqual([{ cantidad: cantidad1, fecha: fecha1 }, { cantidad: cantidad2, fecha: fecha2 }]);
  });

  it('reportarIngresoGasolina debe rechazar cantidad cero o negativa', () => {
    const fecha = '2023-10-27';
    const cantidadInicial = miSurtidor.stock;
    const historialInicial = [...miSurtidor.historialIngresos];

    expect(miSurtidor.reportarIngresoGasolina(0, fecha)).toBe("Por favor, ingrese una cantidad válida y una fecha.");
    expect(miSurtidor.stock).toBe(cantidadInicial);
    expect(miSurtidor.historialIngresos).toEqual(historialInicial);

    expect(miSurtidor.reportarIngresoGasolina(-100, fecha)).toBe("Por favor, ingrese una cantidad válida y una fecha.");
    expect(miSurtidor.stock).toBe(cantidadInicial);
    expect(miSurtidor.historialIngresos).toEqual(historialInicial);
  });

  it('reportarIngresoGasolina debe rechazar ingreso sin fecha', () => {
    const cantidad = 100;
    const cantidadInicial = miSurtidor.stock;
    const historialInicial = [...miSurtidor.historialIngresos];

    expect(miSurtidor.reportarIngresoGasolina(cantidad, '')).toBe("Por favor, ingrese una cantidad válida y una fecha.");
    expect(miSurtidor.stock).toBe(cantidadInicial);
    expect(miSurtidor.historialIngresos).toEqual(historialInicial);

    expect(miSurtidor.reportarIngresoGasolina(cantidad, null)).toBe("Por favor, ingrese una cantidad válida y una fecha.");
    expect(miSurtidor.stock).toBe(cantidadInicial);
    expect(miSurtidor.historialIngresos).toEqual(historialInicial);
  });


  it('reportarIngresoGasolina debe rechazar ingreso que excede la capacidad máxima', () => {
    const cantidadValida = CAPACIDAD_MAXIMA - 100;
    miSurtidor.reportarIngresoGasolina(cantidadValida, '2023-10-27'); 

    const cantidadExcedente = 101; 
    const cantidadInicial = miSurtidor.stock;
    const historialInicial = [...miSurtidor.historialIngresos];

    expect(miSurtidor.reportarIngresoGasolina(cantidadExcedente, '2023-10-28')).toBe("La cantidad ingresada excede la capacidad máxima del surtidor.");
    expect(miSurtidor.stock).toBe(cantidadInicial);
    expect(miSurtidor.historialIngresos).toEqual(historialInicial); 
  });

  it('reportarIngresoGasolina debe permitir ingreso que llena exactamente la capacidad máxima', () => {
    const cantidadValida = CAPACIDAD_MAXIMA;
    const fecha = '2023-10-27';

    const resultado = miSurtidor.reportarIngresoGasolina(cantidadValida, fecha);

    expect(resultado).toBe(`Ingreso de ${cantidadValida} litros registrado correctamente para el surtidor ${nombreTest}.`);
    expect(miSurtidor.stock).toBe(CAPACIDAD_MAXIMA);
    expect(miSurtidor.historialIngresos).toEqual([{ cantidad: cantidadValida, fecha }]);
  });





 
  it('consultarStock debe retornar el stock actual', () => {
    expect(miSurtidor.consultarStock()).toBe(0);
    miSurtidor.reportarIngresoGasolina(500, '2023-10-27');
    expect(miSurtidor.consultarStock()).toBe(500);
  });






  it('validarCapacidadSurtidor debe retornar true si la cantidad no excede la capacidad', () => {
    miSurtidor.stock = 5000;
    expect(miSurtidor.validarCapacidadSurtidor(4000)).toBe(true); 
    expect(miSurtidor.validarCapacidadSurtidor(5000)).toBe(true); 
  });

  it('validarCapacidadSurtidor debe retornar false si la cantidad excede la capacidad', () => {
    miSurtidor.stock = 5000;
    expect(miSurtidor.validarCapacidadSurtidor(5001)).toBe(false); 
    miSurtidor.stock = CAPACIDAD_MAXIMA;
    expect(miSurtidor.validarCapacidadSurtidor(1)).toBe(false); 
  });






  it('estimarAbastecimiento debe retornar mensaje de éxito si hay suficiente stock', () => {
    miSurtidor.stock = 1000;
    const litrosPorAuto = 50;
    const cantidadAutos = 20; 

    expect(miSurtidor.estimarAbastecimiento(litrosPorAuto, cantidadAutos)).toBe(`Se puede abastecer a los ${cantidadAutos} autos.`);
  });

  it('estimarAbastecimiento debe retornar mensaje de éxito si el stock es exactamente el necesario', () => {
    miSurtidor.stock = 1000;
    const litrosPorAuto = 50;
    const cantidadAutos = 20; 

    expect(miSurtidor.estimarAbastecimiento(litrosPorAuto, cantidadAutos)).toBe(`Se puede abastecer a los ${cantidadAutos} autos.`);
  });


  it('estimarAbastecimiento debe retornar mensaje de insuficiencia si no hay suficiente stock', () => {
    miSurtidor.stock = 999;
    const litrosPorAuto = 50;
    const cantidadAutos = 20; 

    expect(miSurtidor.estimarAbastecimiento(litrosPorAuto, cantidadAutos)).toBe(`No hay suficiente stock para abastecer a los ${cantidadAutos} autos.`);
  });

  it('estimarAbastecimiento debe manejar cero autos (debería ser suficiente)', () => {
    miSurtidor.stock = 100;
    const litrosPorAuto = 50;
    const cantidadAutos = 0; 

    expect(miSurtidor.estimarAbastecimiento(litrosPorAuto, cantidadAutos)).toBe(`Se puede abastecer a los ${cantidadAutos} autos.`);
  });

  it('estimarAbastecimiento debe manejar cero litros por auto (debería ser suficiente si cantidadAutos > 0)', () => {
    miSurtidor.stock = 100;
    const litrosPorAuto = 0;
    const cantidadAutos = 10; 

    expect(miSurtidor.estimarAbastecimiento(litrosPorAuto, cantidadAutos)).toBe(`Se puede abastecer a los ${cantidadAutos} autos.`);
  });
});