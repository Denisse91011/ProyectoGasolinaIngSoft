import { iniciarSesion } from './iniciarSesion.js';
import { registroUsuario } from './registroUsuario.js';
import { reportarIngresoGasolina } from './reportarIngresoGasolina.js';
import { solicitarTicketCarga } from './solicitarTicketCarga.js';
import { EstimarTiempoDeEspera } from './EstimarTiempoDeEspera.js';

document.addEventListener('DOMContentLoaded', () => {
  const registroForm = document.getElementById('registro-form');
  const loginForm = document.getElementById('login-form');
  const resultadoDiv = document.getElementById('resultado-div');
  const ingresoForm = document.getElementById('Ingreso-form');
  const usuariosLista = document.getElementById('usuarios-lista');
  const reportarGasolinaDiv = document.getElementById('reporte-gasolina');
  const limpiarDatosBtn = document.getElementById('limpiar-datos-btn');
  const tituloReporteGasolina = document.querySelector('h1#titulo-reporte-gasolina');
  const ticketForm = document.getElementById('ticket-form');
  const reporteTicketsDiv = document.getElementById('reporte-tickets');  // Sección para mostrar los tickets de carg
  const estimarTiempoForm = document.getElementById('estimar-tiempo-form');
  const resultadoEstimacionDiv = document.getElementById('resultado-estimacion');

  let usuariosDB = JSON.parse(localStorage.getItem('usuariosDB')) || [];
  let usuarioActual = null;
  let ingresoGasolina = JSON.parse(localStorage.getItem('ingresoGasolina')) || [];
  let ticketsDeCarga = JSON.parse(localStorage.getItem('ticketsDeCarga')) || [];
  let usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado')) || null;

  function controlarFormularioGasolina() {
    if (usuarioLogueado && usuarioLogueado.tipoUsuario === 'Operario') {
      tituloReporteGasolina.style.display = 'block';
      ingresoForm.style.display = 'block';
    } else {
      tituloReporteGasolina.style.display = 'none';
      ingresoForm.style.display = 'none';
    }
  }

  function controlarFormularioTicketCarga() {
    if (usuarioLogueado && usuarioLogueado.tipoUsuario === 'Conductor') {
      ticketForm.style.display = 'block';
    } else {
      ticketForm.style.display = 'none';
    }
  }

  function renderizarUsuarios() {
    usuariosLista.innerHTML = '';
    if (usuariosDB.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No hay usuarios registrados.';
      usuariosLista.appendChild(li);
      return;
    }

    usuariosDB.forEach(user => {
      const li = document.createElement('li');
      li.textContent = `Nombre: ${user.nombre}, Rol: ${user.tipoUsuario}, Correo: ${user.correo}`;
      usuariosLista.appendChild(li);
    });
  }

  function renderizarReporteGasolina() {
    reportarGasolinaDiv.innerHTML = '';
    if (ingresoGasolina.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'No se han reportado ingresos de gasolina.';
      reportarGasolinaDiv.appendChild(p);
      return;
    }
    ingresoGasolina.forEach(ingreso => {
      const div = document.createElement('div');
      div.innerHTML = `
        <p>Tipo de Gasolina: ${ingreso.tipoCombustible}</p>
        <p>Cantidad: ${ingreso.cantidad} litros</p>
        <p>Fecha de Ingreso: ${ingreso.fechaIngreso}</p>
      `;
      reportarGasolinaDiv.appendChild(div);
    });
  }

  function renderizarTicketsDeCarga() {
    reporteTicketsDiv.innerHTML = '';
    if (ticketsDeCarga.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'No se han solicitado tickets de carga.';
      reporteTicketsDiv.appendChild(p);
      return;
    }

    ticketsDeCarga.forEach(ticket => {
      const div = document.createElement('div');
      div.innerHTML = `
        <p>Tipo de Gasolina: ${ticket.tipoCombustible}</p>
        <p>Cantidad: ${ticket.cantidad} litros</p>
        <p>Fecha de Solicitud: ${ticket.fecha}</p>
      `;
      reporteTicketsDiv.appendChild(div);
    });
  }

  function limpiarDatos() {
    localStorage.removeItem('usuariosDB');
    localStorage.removeItem('ingresosGasolina');
    localStorage.removeItem('ticketsDeCarga');
    usuariosDB = [];
    ingresoGasolina = [];
    ticketsDeCarga = [];
    usuarioLogueado = null;

    renderizarUsuarios();
    renderizarReporteGasolina();
    renderizarTicketsDeCarga();
    resultadoDiv.textContent = 'Datos limpiados correctamente.';
    controlarFormularioGasolina();
    controlarFormularioTicketCarga();
  }

  if (registroForm) {
    registroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('nombre').value;
      const correo = document.getElementById('correo').value;
      const contrasena = document.getElementById('contrasena').value;
      const tipoUsuario = document.getElementById('tipo-usuario').value;

      const resultado = registroUsuario(nombre, correo, contrasena, tipoUsuario, usuariosDB);

      resultadoDiv.textContent = resultado.message;

      if (resultado.success) {
        usuariosDB.push({ nombre, correo, contrasena, tipoUsuario });
        localStorage.setItem('usuariosDB', JSON.stringify(usuariosDB));

        renderizarUsuarios();
        registroForm.reset();
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const correo = document.getElementById('login-correo').value;
      const contrasena = document.getElementById('login-contrasena').value;

      const resultado = iniciarSesion(correo, contrasena, usuariosDB);
      resultadoDiv.textContent = resultado.message;

      if (resultado.success) {
        usuarioActual = usuariosDB.find(user => user.correo === correo);
        ingresoForm.style.display = usuarioActual?.tipoUsuario === 'Operario' ? 'block' : 'none';
        ticketForm.style.display = usuarioActual?.tipoUsuario === 'Conductor' ? 'block' : 'none';
        localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioActual));
        controlarFormularioGasolina();
        controlarFormularioTicketCarga();
      }
    });
  }

  if (ingresoForm) {
    ingresoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!usuarioActual || usuarioActual.tipoUsuario !== 'Operario') {
        resultadoDiv.textContent = 'Solo los operarios pueden reportar ingreso de gasolina.';
        return;
      }

      const tipoCombustible = document.getElementById('tipo-combustible').value;
      const cantidad = parseFloat(document.getElementById('cantidad').value);
      const fecha = document.getElementById('fecha').value;

      const resultado = reportarIngresoGasolina(tipoCombustible, cantidad, fecha);

      if (resultado.success) {
        ingresoGasolina.push({ tipoCombustible, cantidad, fechaIngreso: fecha });
        localStorage.setItem('ingresoGasolina', JSON.stringify(ingresoGasolina));
        renderizarReporteGasolina();
      }

      resultadoDiv.textContent = resultado.message;
    });
  }

  if (ticketForm) {
    ticketForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!usuarioActual || usuarioActual.tipoUsuario !== 'Conductor') {
        resultadoDiv.textContent = 'Solo los conductores pueden solicitar un ticket de carga.';
        return;
      }

      const tipoCombustible = document.getElementById('tipo-combustible').value;
      const cantidad = parseFloat(document.getElementById('cantidad').value);
      const fecha = document.getElementById('fecha').value;

      const ticket = { tipoCombustible, cantidad, fecha };
      ticketsDeCarga.push(ticket);
      localStorage.setItem('ticketsDeCarga', JSON.stringify(ticketsDeCarga));

      resultadoDiv.textContent = `Ticket de carga solicitado con éxito para ${cantidad} litros de ${tipoCombustible}. Fecha: ${fecha}`;
      renderizarTicketsDeCarga();
    });
  }

  if (limpiarDatosBtn) {
    limpiarDatosBtn.addEventListener('click', limpiarDatos);
  }

  if (estimarTiempoForm) {
    estimarTiempoForm.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const numeroAutos = parseInt(document.getElementById('estimar-cant-autos').value);
      const tiempoPromedioPorAuto = parseFloat(document.getElementById('estimar-prom-auto').value);
  
      const resultado = EstimarTiempoDeEspera(numeroAutos, tiempoPromedioPorAuto);
  
      if (resultado === 0) {
        resultadoEstimacionDiv.textContent = 'Los valores deben ser mayores a cero.';
      } else {
        resultadoEstimacionDiv.textContent = `El tiempo estimado de espera es: ${resultado} minutos.`;
      }
    });
  }

  renderizarUsuarios();
  renderizarReporteGasolina();
  renderizarTicketsDeCarga();
  controlarFormularioGasolina();
  controlarFormularioTicketCarga();
});
