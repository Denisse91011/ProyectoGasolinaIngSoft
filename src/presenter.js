
import { surtidor, CAPACIDAD_MAXIMA } from './surtidor.js';
import { Usuario } from './usuario.js';


if (window.Cypress) { 
    window.appResetTicketCounter = Usuario.resetTicketCounter;
    window.Usuario = Usuario; 
}

const surtidores = [];
const tickets = [];
const failedCancellationAttempts = [];

document.addEventListener('DOMContentLoaded', () => {
  const surtidorForm = document.getElementById('surtidor-form');
  const nombreSurtidorInput = document.getElementById('nombre-surtidor');
  const tipoSurtidorInput = document.getElementById('tipo-surtidor');
  const reporteSurtidores = document.getElementById('reporte-surtidores');

  const formIngreso = document.getElementById('Ingreso-form');
  const selectSurtidorIngreso = document.getElementById('select-surtidor-ingreso');
  const cantidadInput = document.getElementById('cantidad');
  const mensajeCapacidad = document.getElementById('mensaje-capacidad'); 
  const fechaInput = document.getElementById('fecha');
  const reporteGasolinaDiv = document.getElementById('reporte-gasolina'); 

  const selectSurtidorStock = document.getElementById('select-surtidor-stock');
  const consultarStockBtn = document.getElementById('consultar-stock-btn');
  const resultadoStockDiv = document.getElementById('resultado-stock');

  const estimacionForm = document.getElementById('estimacion-form');
  const selectSurtidorEstimacion = document.getElementById('select-surtidor-estimacion');
  const litrosAutoInput = document.getElementById('litros-auto');
  const cantidadAutosInput = document.getElementById('cantidad-autos');
  const resultadoEstimacionDiv = document.getElementById('resultado-estimacion');

  const ticketForm = document.getElementById('ticket-form');
  const selectSurtidorTicket = document.getElementById('select-surtidor-ticket');
  const ticketCantidadInput = document.getElementById('ticket-cantidad');
  const ticketCantidadMensajeDiv = document.getElementById('ticket-cantidad-mensaje'); 
  const ticketFechaInput = document.getElementById('ticket-fecha');
  const ticketPlacaInput = document.getElementById('ticket-placa');
  const ticketResultadoDiv = document.getElementById('ticket-resultado');

  const cancelTicketForm = document.getElementById('cancel-ticket-form');
  const ticketNumeroCancelarInput = document.getElementById('ticket-numero-cancelar');
  const cancelTicketMessageDiv = document.getElementById('cancel-ticket-message'); 
  const cancelTicketResultDiv = document.getElementById('cancel-ticket-result');
  const failedCancellationHistoryDiv = document.getElementById('failed-cancellation-history');

  const verificarTurnoForm = document.getElementById('verificar-turno-form');
  const numeroTicketVerificarInput = document.getElementById('numero-ticket-verificar'); 
  const selectSurtidorVerificarTurno = document.getElementById('select-surtidor-verificar-turno'); 
  const verificarTurnoResultDiv = document.getElementById('verificar-turno-result'); 


  const ticketHistoryDiv = document.getElementById('ticket-history');


  function encontrarSurtidorPorNombre(nombre) {
    if (!nombre) return null;
    const nombreNormalizado = nombre.trim().toLowerCase();
    return surtidores.find(s => s.nombre.trim().toLowerCase() === nombreNormalizado);
  }

  function validarCapacidadParaSurtidorSeleccionado(cantidad, surtidor) {
    if (!surtidor) {
      return { valid: false, message: 'Por favor, seleccione un surtidor.' };
    }
    if (cantidad < 0.01) {
      return { valid: false, message: 'La cantidad debe ser positiva.' };
    }
    const esValido = surtidor.validarCapacidadSurtidor(cantidad);
    if (!esValido) {
      const espacioDisponible = CAPACIDAD_MAXIMA - surtidor.stock; 
      return { valid: false, message: `Capacidad excedida para "${surtidor.nombre}". Espacio disponible: ${espacioDisponible.toFixed(2)} l.` };
    }
    return { valid: true, message: `✔ Capacidad OK para "${surtidor.nombre}".` };
  }

  function populateSurtidorSelects() {
    const selectsToUpdate = [
        selectSurtidorIngreso,
        selectSurtidorStock,
        selectSurtidorEstimacion,
        selectSurtidorTicket,
        selectSurtidorVerificarTurno
    ];

    selectsToUpdate.forEach(selectElement => {
      if (!selectElement) return;

      const selectedValue = selectElement.value;
      const defaultOptionHTML = '<option value="">-- Seleccione un surtidor --</option>';
      selectElement.innerHTML = defaultOptionHTML;

      surtidores.forEach(surtidor => {
        const option = document.createElement('option');
        option.value = surtidor.nombre;
        option.textContent = `${surtidor.nombre} (${surtidor.tipoCombustible})`;
        selectElement.appendChild(option);
      });

      if (selectedValue && selectElement.querySelector(`option[value="${selectedValue}"]`)) {
        selectElement.value = selectedValue;
      } else {
        selectElement.value = "";
      }
    });
  }

  function actualizarVistaSurtidores() {
    if (!reporteSurtidores) return;

    if (surtidores.length === 0) {
      reporteSurtidores.innerHTML = '<p>No hay surtidores agregados aún.</p>';
    } else {
      reporteSurtidores.innerHTML = surtidores.map(s =>
        `<p><strong>${s?.nombre || 'N/A'}</strong> - ${s?.tipoCombustible || 'N/A'} (Stock: ${s?.stock?.toFixed(2) || '0.00'} l)</p>`
      ).join('');
    }
    populateSurtidorSelects();
  }

  const updateCapacidadMessage = () => {
    if (!mensajeCapacidad) return; 

    const cantidad = parseFloat(cantidadInput?.value.trim());
    const surtidorSeleccionadoNombre = selectSurtidorIngreso?.value;
    const surtidorSeleccionado = encontrarSurtidorPorNombre(surtidorSeleccionadoNombre);

    if (!surtidorSeleccionadoNombre) {
      mensajeCapacidad.textContent = 'Seleccione un surtidor para validar capacidad.';
      mensajeCapacidad.className = ''; 
      return;
    }
    if (isNaN(cantidad)) {
      mensajeCapacidad.textContent = 'Ingrese una cantidad numérica válida.';
      mensajeCapacidad.className = '';
      return;
    }
    if (cantidad < 0.01) {
      mensajeCapacidad.textContent = 'La cantidad debe ser positiva.';
      mensajeCapacidad.className = 'invalid'; 
      return;
    }

    const validacion = validarCapacidadParaSurtidorSeleccionado(cantidad, surtidorSeleccionado);
    mensajeCapacidad.textContent = validacion.message;
    mensajeCapacidad.className = validacion.valid ? 'valid' : 'invalid';
  };

  cantidadInput?.addEventListener('input', updateCapacidadMessage);
  selectSurtidorIngreso?.addEventListener('change', updateCapacidadMessage);

  function renderTicketHTML(ticket) {
    const surtidorNombre = ticket.surtidorNombre || 'No especificado';
    const statusClass = `status-${ticket.status.replace(/ /g, '')}`;

    return `
        <div class="ticket-entry">
            <h3>Ticket #${ticket.numeroTicket}</h3>
            <div class="ticket-inline-info">
                <p><strong>Surtidor:</strong> ${surtidorNombre}</p>
                <p><strong>Tipo:</strong> ${ticket.tipoCombustible}</p>
            </div>
            <div class="ticket-inline-info">
                <p><strong>Cantidad:</strong> ${ticket.cantidadCargada.toFixed(2)} l</p>
                <p><strong>Fecha/Hora:</strong> ${ticket.fechaHora}</p>
            </div>
            <p><strong>Placa:</strong> ${ticket.placaVehiculo}</p>
            <p><strong>Estado:</strong> <span class="ticket-status ${statusClass}">${ticket.status}</span></p>
        </div>
    `;
  }

  function renderTicketHistory() {
    if (!ticketHistoryDiv) return;
    ticketHistoryDiv.innerHTML = '';

    if (tickets.length === 0) {
      ticketHistoryDiv.innerHTML = '<p>No se han generado tickets aún.</p>';
    } else {
      tickets.slice().reverse().forEach(ticket => {
        ticketHistoryDiv.innerHTML += renderTicketHTML(ticket);
      });
    }
  }

  function renderFailedCancellationHistory() {
    if (!failedCancellationHistoryDiv) return;
    failedCancellationHistoryDiv.innerHTML = '';

    if (failedCancellationAttempts.length === 0) {
      failedCancellationHistoryDiv.innerHTML = '<p>No hay intentos fallidos registrados.</p>';
    } else {
      failedCancellationAttempts.slice().reverse().forEach(attempt => {
        const attemptElement = document.createElement('div');
        attemptElement.classList.add('failed-attempt-entry');
        attemptElement.innerHTML = `
            <p><strong>Ticket #:</strong> ${attempt.ticketNumber}</p>
            <p><strong>Fecha/Hora:</strong> ${attempt.timestamp}</p>
            <p><strong>Razón:</strong> ${attempt.reason}</p>
        `;
        failedCancellationHistoryDiv.appendChild(attemptElement);
      });
    }
  }

  surtidorForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = nombreSurtidorInput?.value.trim();
    const tipo = tipoSurtidorInput?.value.trim();

    if (!nombre || !tipo) {
      alert('Por favor, ingrese nombre y tipo para el surtidor.');
      return;
    }
    if (encontrarSurtidorPorNombre(nombre)) {
      alert(`Ya existe un surtidor con el nombre "${nombre}". Por favor, elija un nombre diferente.`);
      return;
    }

    const nuevoSurtidor = new surtidor(nombre, tipo);
    surtidores.push(nuevoSurtidor);
    actualizarVistaSurtidores();
    alert(`Surtidor "${nombre}" de tipo "${tipo}" agregado correctamente.`);
    surtidorForm.reset();
    if (mensajeCapacidad) { 
        mensajeCapacidad.textContent = `Capacidad máxima global: ${CAPACIDAD_MAXIMA} litros`;
        mensajeCapacidad.className = '';
    }
  });

  formIngreso?.addEventListener('submit', (e) => {
    e.preventDefault();
    const surtidorSeleccionadoNombre = selectSurtidorIngreso?.value;
    const cantidad = parseFloat(cantidadInput?.value);
    const fecha = fechaInput?.value;

    if (!surtidorSeleccionadoNombre) {
      alert('Error: Por favor, seleccione un surtidor.');
      return;
    }
    const surtidorSeleccionado = encontrarSurtidorPorNombre(surtidorSeleccionadoNombre);
    if (!surtidorSeleccionado) {
      alert(`Error interno: No se encontró la instancia del surtidor "${surtidorSeleccionadoNombre}".`);
      return;
    }
    if (isNaN(cantidad) || cantidad <= 0) {
      alert('Error: La cantidad debe ser un número positivo.');
      return;
    }
    if (!fecha) {
      alert('Error: Por favor, seleccione una fecha.');
      return;
    }
    if (!surtidorSeleccionado.validarCapacidadSurtidor(cantidad)) {
      const espacioDisponible = CAPACIDAD_MAXIMA - surtidorSeleccionado.stock;
      alert(`Error: La cantidad de ${cantidad.toFixed(2)} litros excede la capacidad del surtidor "${surtidorSeleccionado.nombre}" (${surtidorSeleccionado.stock.toFixed(2)}/${CAPACIDAD_MAXIMA.toFixed(2)} l). Espacio disponible: ${espacioDisponible.toFixed(2)} l.`);
      return;
    }

    const resultadoReporte = surtidorSeleccionado.reportarIngresoGasolina(cantidad, fecha);
    if (reporteGasolinaDiv) { 
      const entrada = document.createElement('p');
      entrada.textContent = resultadoReporte;
      reporteGasolinaDiv.appendChild(entrada);
    }
    formIngreso.reset();
    actualizarVistaSurtidores(); 
    if (mensajeCapacidad) {
        mensajeCapacidad.textContent = `Capacidad máxima global: ${CAPACIDAD_MAXIMA} litros`; 
        mensajeCapacidad.className = '';
    }
  });

  consultarStockBtn?.addEventListener('click', () => {
    const surtidorSeleccionadoNombre = selectSurtidorStock?.value;
    if (!surtidorSeleccionadoNombre) {
      if (resultadoStockDiv) resultadoStockDiv.textContent = 'Por favor, seleccione un surtidor.';
      return;
    }
    const surtidorSeleccionado = encontrarSurtidorPorNombre(surtidorSeleccionadoNombre);
    if (!surtidorSeleccionado) {
      if (resultadoStockDiv) resultadoStockDiv.textContent = `Error interno: No se encontró la instancia del surtidor "${surtidorSeleccionadoNombre}".`;
      return;
    }
    const stockActual = surtidorSeleccionado.consultarStock();
    if (resultadoStockDiv) {
      resultadoStockDiv.textContent = `Stock actual del surtidor "${surtidorSeleccionado.nombre}" (${surtidorSeleccionado.tipoCombustible}): ${stockActual.toFixed(2)} litros.`;
    }
  });

  estimacionForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const surtidorSeleccionadoNombre = selectSurtidorEstimacion?.value;
    const litrosPorAuto = parseFloat(litrosAutoInput?.value);
    const cantidadAutos = parseInt(cantidadAutosInput?.value);

    if (!surtidorSeleccionadoNombre) {
      if (resultadoEstimacionDiv) resultadoEstimacionDiv.textContent = 'Por favor, seleccione un surtidor.';
      return;
    }
    const surtidorSeleccionado = encontrarSurtidorPorNombre(surtidorSeleccionadoNombre);
    if (!surtidorSeleccionado) {
      if (resultadoEstimacionDiv) resultadoEstimacionDiv.textContent = `Error interno: No se encontró la instancia del surtidor "${surtidorSeleccionadoNombre}".`;
      return;
    }
    if (isNaN(litrosPorAuto) || litrosPorAuto <= 0) { 
      if (resultadoEstimacionDiv) resultadoEstimacionDiv.textContent = 'Por favor, ingrese una cantidad válida de litros por auto (mayor a 0).';
      return;
    }
    if (isNaN(cantidadAutos) || cantidadAutos <= 0) { 
      if (resultadoEstimacionDiv) resultadoEstimacionDiv.textContent = 'Por favor, ingrese una cantidad válida de autos (mayor a 0).';
      return;
    }
    const resultadoEstimacion = surtidorSeleccionado.estimarAbastecimiento(litrosPorAuto, cantidadAutos);
    if (resultadoEstimacionDiv) {
      resultadoEstimacionDiv.textContent = resultadoEstimacion;
    }
  });

  const updateTicketCantidadMessage = () => {
    if (!ticketCantidadMensajeDiv) return;
    const cantidad = parseFloat(ticketCantidadInput?.value.trim());
    if (isNaN(cantidad) || ticketCantidadInput?.value.trim() === '') { 
      ticketCantidadMensajeDiv.textContent = ''; 
      ticketCantidadMensajeDiv.className = '';
      return;
    }
    if (cantidad <= 0) {
      ticketCantidadMensajeDiv.textContent = 'Cantidad inválida: debe ingresar un valor positivo';
      ticketCantidadMensajeDiv.className = 'invalid';
      return;
    }
    ticketCantidadMensajeDiv.textContent = '✔ Cantidad válida.';
    ticketCantidadMensajeDiv.className = 'valid';
  };
  ticketCantidadInput?.addEventListener('input', updateTicketCantidadMessage);

  ticketForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const surtidorSeleccionadoNombre = selectSurtidorTicket?.value;
    const cantidad = parseFloat(ticketCantidadInput?.value);
    const fecha = ticketFechaInput?.value;
    const placa = ticketPlacaInput?.value.trim();

    if (ticketResultadoDiv) {
      ticketResultadoDiv.innerHTML = ''; 
      ticketResultadoDiv.className = 'report-output'; 
    }
    if (!surtidorSeleccionadoNombre) {
      if (ticketResultadoDiv) {
        ticketResultadoDiv.textContent = 'Error: Por favor, seleccione un surtidor para generar el ticket.';
        ticketResultadoDiv.className = 'report-output invalid';
      }
      return;
    }
    const surtidorSeleccionado = encontrarSurtidorPorNombre(surtidorSeleccionadoNombre);
    if (!surtidorSeleccionado) {
      if (ticketResultadoDiv) {
        ticketResultadoDiv.textContent = `Error interno: No se encontró la instancia del surtidor "${surtidorSeleccionadoNombre}".`;
        ticketResultadoDiv.className = 'report-output invalid';
      }
      return;
    }
    if (surtidorSeleccionado.stock < cantidad) {
        if (ticketResultadoDiv) {
            ticketResultadoDiv.textContent = `Error: No hay suficiente stock en el surtidor "${surtidorSeleccionado.nombre}". Stock actual: ${surtidorSeleccionado.stock.toFixed(2)} l.`;
            ticketResultadoDiv.className = 'report-output invalid';
        }
        return;
    }


    const tipo = surtidorSeleccionado.tipoCombustible;
    const resultado = Usuario.generarTicketCarga(surtidorSeleccionado.nombre, tipo, cantidad, fecha, placa);

    if (ticketResultadoDiv) {
      if (resultado.success) {
        const ticketGenerado = resultado.ticket;
        surtidorSeleccionado.stock -= ticketGenerado.cantidadCargada; 
        actualizarVistaSurtidores(); 

        ticketResultadoDiv.innerHTML = renderTicketHTML(ticketGenerado); 
        ticketResultadoDiv.className = 'report-output valid'; 
        tickets.push(ticketGenerado);
        renderTicketHistory();
        ticketForm.reset();
        if (ticketCantidadMensajeDiv) {
          ticketCantidadMensajeDiv.textContent = '';
          ticketCantidadMensajeDiv.className = '';
        }
      } else {
        ticketResultadoDiv.textContent = `Error: ${resultado.message}`;
        ticketResultadoDiv.className = 'report-output invalid';
      }
    }
  });

  const updateCancelTicketMessage = () => {
    if (!cancelTicketMessageDiv) return;
    const numeroInput = ticketNumeroCancelarInput?.value.trim();
    if (numeroInput === '') {
      cancelTicketMessageDiv.textContent = '';
      cancelTicketMessageDiv.className = '';
      return;
    }
    const numero = parseInt(numeroInput);
    if (isNaN(numero) || numero <= 0) {
      cancelTicketMessageDiv.textContent = 'Por favor, ingrese un número de ticket válido (positivo).';
      cancelTicketMessageDiv.className = 'invalid';
    } else {
      cancelTicketMessageDiv.textContent = '';
      cancelTicketMessageDiv.className = ''; 
    }
  };
  ticketNumeroCancelarInput?.addEventListener('input', updateCancelTicketMessage);

  cancelTicketForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const numeroTicketToCancel = ticketNumeroCancelarInput?.value.trim();
    if (cancelTicketResultDiv) {
      cancelTicketResultDiv.textContent = '';
      cancelTicketResultDiv.className = 'report-output'; 
    }
    if (cancelTicketMessageDiv) {
        cancelTicketMessageDiv.textContent = '';
        cancelTicketMessageDiv.className = '';
    }
    if (!numeroTicketToCancel) {
      if (cancelTicketResultDiv) {
        cancelTicketResultDiv.textContent = 'Error: Por favor, ingrese el número del ticket a cancelar.';
        cancelTicketResultDiv.className = 'report-output invalid';
      }
      return;
    }
    const numeroParsed = parseInt(numeroTicketToCancel);
    if (isNaN(numeroParsed) || numeroParsed <= 0) {
      if (cancelTicketResultDiv) {
        cancelTicketResultDiv.textContent = 'Error: Número de ticket inválido. Debe ser un número positivo.';
        cancelTicketResultDiv.className = 'report-output invalid';
      }
      return;
    }
    const resultadoCancelacion = Usuario.cancelarTicketCarga(numeroParsed, tickets);
    if (cancelTicketResultDiv) {
      if (resultadoCancelacion.success) {
        cancelTicketResultDiv.textContent = resultadoCancelacion.message;
        cancelTicketResultDiv.className = 'report-output valid';
        renderTicketHistory(); 
        cancelTicketForm.reset();
      } else {
        cancelTicketResultDiv.textContent = resultadoCancelacion.message;
        cancelTicketResultDiv.className = 'report-output invalid';
        if (resultadoCancelacion.failedAttempt) {
          failedCancellationAttempts.push(resultadoCancelacion.failedAttempt);
          renderFailedCancellationHistory();
        }
      }
    }
  });

  verificarTurnoForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const numeroTicket = parseInt(numeroTicketVerificarInput?.value);
    const surtidorNombre = selectSurtidorVerificarTurno?.value;

    if (verificarTurnoResultDiv) {
        verificarTurnoResultDiv.innerHTML = '<p class="placeholder-text">Verificando...</p>'; 
        verificarTurnoResultDiv.className = 'result-box'; 
    }

    if (isNaN(numeroTicket) || numeroTicket <= 0) {
        if (verificarTurnoResultDiv) {
            verificarTurnoResultDiv.innerHTML = '<p class="error-text">Por favor, ingrese un número de ticket válido.</p>';
        }
        return;
    }
    if (!surtidorNombre) {
        if (verificarTurnoResultDiv) {
            verificarTurnoResultDiv.innerHTML = '<p class="error-text">Por favor, seleccione un surtidor.</p>';
        }
        return;
    }

    const resultado = Usuario.verificarTurnoTicket(numeroTicket, surtidorNombre, tickets);
    if (verificarTurnoResultDiv) {
        let mensajeHtml = ``; 

        if (resultado.ticketStatus === null) {
            mensajeHtml += `<p>Ticket #${numeroTicket} no encontrado para el surtidor "${surtidorNombre}".</p>`;
        } else {
            mensajeHtml += `<p><strong>Ticket #${numeroTicket} (${surtidorNombre})</strong></p>`;
            mensajeHtml += `<p>Estado actual: <span class="status-${resultado.ticketStatus.replace(/ /g, '')}">${resultado.ticketStatus}</span></p>`;

            if (resultado.currentPosition !== -1 && resultado.ticketStatus === Usuario.TICKET_STATUS.GENERADO) {
                mensajeHtml += `<p>Posición en la cola: ${resultado.currentPosition} de ${resultado.totalWaiting} en espera.</p>`;
            }
            if (resultado.message) {
                 mensajeHtml += `<p class="${resultado.notificar ? 'notificacion-turno' : ''}">${resultado.message}</p>`;
            }
            if (resultado.ticketStatus !== Usuario.TICKET_STATUS.GENERADO && resultado.ticketStatus !== null) {
                mensajeHtml += `<p>Este ticket ya no está en la cola de espera activa.</p>`;
            }
        }
        verificarTurnoResultDiv.innerHTML = mensajeHtml;
    }
  });


  actualizarVistaSurtidores();
  if (mensajeCapacidad) {
    mensajeCapacidad.textContent = `Capacidad máxima global: ${CAPACIDAD_MAXIMA} litros`; 
    mensajeCapacidad.className = '';
  }
  if (ticketCantidadMensajeDiv) {
    ticketCantidadMensajeDiv.textContent = '';
    ticketCantidadMensajeDiv.className = '';
  }
  if (cancelTicketMessageDiv) {
    cancelTicketMessageDiv.textContent = '';
    cancelTicketMessageDiv.className = '';
  }
  renderTicketHistory();
  renderFailedCancellationHistory();

  if (verificarTurnoResultDiv) {
    verificarTurnoResultDiv.innerHTML = '<p class="placeholder-text">Ingrese los datos del ticket para verificar su estado.</p>';
  }
});