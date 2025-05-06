import { reportarIngresoGasolina } from './reportarIngresoGasolina.js';
import { agregarSurtidor } from './agregarSurtidor.js';
import { reportarIngresoGasolina, consultarStock } from './stockCombustible.js';


const form = document.getElementById('Ingreso-form');
const reporteDiv = document.getElementById('reporte-gasolina');
const surtidorForm = document.getElementById('surtidor-form');
const reporteSurtidores = document.getElementById('reporte-surtidores');
const surtidores = [];

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const tipo = document.getElementById('tipo-combustible').value.trim();
  const cantidad = parseFloat(document.getElementById('cantidad').value);
  const fecha = document.getElementById('fecha').value;

  const resultado = reportarIngresoGasolina(tipo, cantidad, fecha);

  if (resultado.success) {
    const entrada = document.createElement('p');
    entrada.textContent = `✔ ${tipo}, ${cantidad} litros, fecha: ${fecha}`;
    reporteDiv.appendChild(entrada);
  } else {
    alert(resultado.message);
  }

  form.reset();
});


surtidorForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre-surtidor').value.trim();
  const tipo = document.getElementById('tipo-surtidor').value.trim();

  const resultado = agregarSurtidor(nombre, tipo);
  if (resultado.success) {
    surtidores.push(resultado.data);
    actualizarVistaSurtidores();
    surtidorForm.reset();
  }

  alert(resultado.message);
});


function actualizarVistaSurtidores() {
  reporteSurtidores.innerHTML = '<h3>Lista de Surtidores:</h3>' + surtidores.map(s =>
    `<p><strong>${s.nombre}</strong> - ${s.tipoCombustible}</p>`
  ).join('');
}


const consultarStockBtn = document.getElementById('consultar-stock-btn');
const resultadoStockDiv = document.getElementById('resultado-stock');

consultarStockBtn.addEventListener('click', () => {
  const tipo = document.getElementById('tipo-stock').value.trim();
  const cantidad = consultarStock(tipo);
  resultadoStockDiv.textContent = `Stock actual de "${tipo}": ${cantidad} litros.`;
});
