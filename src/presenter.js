// src/presenter.js
import { reportarIngresoGasolina } from './reportarIngresoGasolina.js';

const form = document.getElementById('Ingreso-form');
const reporteDiv = document.getElementById('reporte-gasolina');
const limpiarBtn = document.getElementById('limpiar-datos-btn');

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

limpiarBtn.addEventListener('click', () => {
  reporteDiv.innerHTML = '';
});
