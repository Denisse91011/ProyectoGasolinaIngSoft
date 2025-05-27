import { surtidor, CAPACIDAD_MAXIMA } from './surtidor.js';
import { generarTicketCarga, cancelarTicketCarga, verificarTurnoTicket, TICKET_STATUS } from './usuario.js';


const surtidores = [];
const tickets = [];
const failedCancellationAttempts = [];

document.addEventListener('DOMContentLoaded', () => {
  const formIngreso = document.getElementById('Ingreso-form');
  const selectSurtidorIngreso = document.getElementById('select-surtidor-ingreso');
  const cantidadInput = document.getElementById('cantidad');
  const mensajeCapacidad = document.getElementById('mensaje-capacidad');
  const fechaInput = document.getElementById('fecha');
  const reporteDiv = document.getElementById('reporte-gasolina');

  const surtidorForm = document.getElementById('surtidor-form');
  const nombreSurtidorInput = document.getElementById('nombre-surtidor');
  const tipoSurtidorInput = document.getElementById('tipo-surtidor');
  const reporteSurtidores = document.getElementById('reporte-surtidores');

  const consultarStockBtn = document.getElementById('consultar-stock-btn');

  const selectSurtidorStock = document.getElementById('select-surtidor-stock');
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
  const ticketHistoryDiv = document.getElementById('ticket-history'); 

  const cancelTicketForm = document.getElementById('cancel-ticket-form');
  const ticketNumeroCancelarInput = document.getElementById('ticket-numero-cancelar');
  const cancelTicketMessageDiv = document.getElementById('cancel-ticket-message'); 
  const cancelTicketResultDiv = document.getElementById('cancel-ticket-result'); 
  const failedCancellationHistoryDiv = document.getElementById('failed-cancellation-history'); 

  const formVerificarTurno = document.getElementById('verificar-turno-form');
  const numeroTicketInput = document.getElementById('verificar-numero-ticket');
  const selectSurtidorTurno = document.getElementById('select-surtidor-turno');
  const messageDiv = document.getElementById('verificar-turno-message');
  const resultDiv = document.getElementById('verificar-turno-result');
  const historyDiv = document.getElementById('failed-verification-history');

  function encontrarSurtidorPorNombre(nombre) {
    if (!nombre) return null;
     const nombreNormalizado = nombre.trim().toLowerCase();
    return surtidores.find(s => s.nombre.trim().toLowerCase() === nombreNormalizado);
  }

  function validarCapacidadParaSurtidorSeleccionado(cantidad, surtidor) {
      if (!surtidor) {

           return { valid: false, message: ' Por favor, seleccione un surtidor.' };
      }

      if (cantidad < 0.01) {
          return { valid: false, message: ' La cantidad debe ser positiva.' };
      }

      const esValido = surtidor.validarCapacidadSurtidor(cantidad);
       if (!esValido) {
           const espacioDisponible = CAPACIDAD_MAXIMA - surtidor.stock;
           return { valid: false, message: ` Capacidad excedida para "${surtidor.nombre}". Espacio disponible: ${espacioDisponible} l.` };
       }
       return { valid: true, message: `✔ Capacidad OK para "${surtidor.nombre}".` };
  }

  function populateSurtidorSelects() {
       const selectsToUpdate = [selectSurtidorIngreso, selectSurtidorStock, selectSurtidorEstimacion, selectSurtidorTicket, selectSurtidorTurno];

       selectsToUpdate.forEach(selectElement => {
 
           if (!selectElement) return;

           const selectedValue = selectElement.value;

           const defaultOption = selectElement.querySelector('option[value=""]');
           selectElement.innerHTML = ''; 

           if (defaultOption) {
             selectElement.appendChild(defaultOption); 
           } else {
             const defaultNewOption = document.createElement('option');
             defaultNewOption.value = "";
             defaultNewOption.textContent = "-- Seleccione un surtidor --";
             selectElement.appendChild(defaultNewOption);
           }


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
          `<p><strong>${s?.nombre || 'N/A'}</strong> - ${s?.tipoCombustible || 'N/A'} (Stock: ${s?.stock || 0} l)</p>`
        ).join('');
    }
     populateSurtidorSelects(); 
  }


   const updateCapacidadMessage = () => {
       const cantidad = parseFloat(cantidadInput?.value.trim());
       const surtidorSeleccionadoNombre = selectSurtidorIngreso?.value;
       const surtidorSeleccionado = encontrarSurtidorPorNombre(surtidorSeleccionadoNombre);

       if (!mensajeCapacidad) return;

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
             mensajeCapacidad.className = '';
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


       const ticketHTML = `
           <div class="ticket-entry">
               <h3>Ticket #${ticket.numeroTicket}</h3>
                <div class="ticket-inline-info">
                    <p><strong>Surtidor:</strong> ${surtidorNombre}</p>
                    <p><strong>Tipo:</strong> ${ticket.tipoCombustible}</p>
                </div>
                <div class="ticket-inline-info">
                    <p><strong>Cantidad:</strong> ${ticket.cantidadCargada} l</p>
                    <p><strong>Fecha/Hora:</strong> ${ticket.fechaHora}</p>
                </div>
               <p><strong>Placa:</strong> ${ticket.placaVehiculo}</p>
               <p><strong>Estado:</strong> <span class="ticket-status ${statusClass}">${ticket.status}</span></p>
           </div>
       `;
       return ticketHTML;
  }


  function renderTicketHistory() {
      if (!ticketHistoryDiv) return;

      ticketHistoryDiv.innerHTML = '';

      if (tickets.length === 0) {
          ticketHistoryDiv.innerHTML = '<p>No se han generado tickets aún.</p>';
      } else {
           tickets.slice().reverse().forEach(ticket => { 
               const ticketElement = document.createElement('div');
               ticketElement.innerHTML = renderTicketHTML(ticket); 
               ticketHistoryDiv.appendChild(ticketElement); 
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
         mensajeCapacidad.textContent = 'Seleccione un surtidor para validar capacidad.'; 
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
         alert(`Error: La cantidad de ${cantidad} litros excede la capacidad del surtidor "${surtidorSeleccionado.nombre}" (${surtidorSeleccionado.stock}/${CAPACIDAD_MAXIMA} l). Espacio disponible: ${espacioDisponible} l.`);
         return;
      }


    const resultadoReporte = surtidorSeleccionado.reportarIngresoGasolina(cantidad, fecha);

    if (reporteDiv) {
        const entrada = document.createElement('p');
        entrada.textContent = resultadoReporte;
        reporteDiv.appendChild(entrada);
    }


    formIngreso.reset();
    actualizarVistaSurtidores(); 
     if (mensajeCapacidad) {
        mensajeCapacidad.textContent = 'Seleccione un surtidor para validar capacidad.';
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

    const cantidad = surtidorSeleccionado.consultarStock();

    if (resultadoStockDiv) {
      resultadoStockDiv.textContent = `Stock actual del surtidor "${surtidorSeleccionado.nombre}" (${surtidorSeleccionado.tipoCombustible}): ${cantidad} litros.`;
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

     if (isNaN(litrosPorAuto) || litrosPorAuto < 0) {
         if (resultadoEstimacionDiv) resultadoEstimacionDiv.textContent = 'Por favor, ingrese una cantidad válida de litros por auto.';
         return;
     }
     if (isNaN(cantidadAutos) || cantidadAutos < 0) {
         if (resultadoEstimacionDiv) resultadoEstimacionDiv.textContent = 'Por favor, ingrese una cantidad válida de autos.';
         return;
     }


    const resultadoEstimacion = surtidorSeleccionado.estimarAbastecimiento(litrosPorAuto, cantidadAutos);

    if (resultadoEstimacionDiv) {
      resultadoEstimacionDiv.textContent = resultadoEstimacion;
    }

    estimacionForm.reset();
  });



  const updateTicketCantidadMessage = () => {
      const cantidad = parseFloat(ticketCantidadInput?.value.trim());

      if (!ticketCantidadMensajeDiv) return; 

      if (isNaN(cantidad)) {
          ticketCantidadMensajeDiv.textContent = 'Ingrese una cantidad numérica válida.';
          ticketCantidadMensajeDiv.className = ''; 
          return;
      }
      if (cantidad <= 0) {
          ticketCantidadMensajeDiv.textContent = 'Cantidad inválida: debe ingresar un valor positivo';
          ticketCantidadMensajeDiv.className = 'invalid'; 
          return;
      }

     
      ticketCantidadMensajeDiv.textContent = ''; 
      ticketCantidadMensajeDiv.className = ''; 
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
          ticketResultadoDiv.textContent = ''; 
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

       const tipo = surtidorSeleccionado.tipoCombustible;

      const resultado = generarTicketCarga(surtidorSeleccionado.nombre, tipo, cantidad, fecha, placa);

      if (ticketResultadoDiv) { 
          if (resultado.success) {
              const ticketGenerado = resultado.ticket;

              ticketResultadoDiv.innerHTML = renderTicketHTML(ticketGenerado);
              ticketResultadoDiv.className = 'report-output valid'; 

              tickets.push(ticketGenerado); 
              renderTicketHistory(); 

              ticketForm.reset();
              if (ticketCantidadMensajeDiv) ticketCantidadMensajeDiv.textContent = ''; 
          } else {
              ticketResultadoDiv.textContent = `Error: ${resultado.message}`;
               ticketResultadoDiv.className = 'report-output invalid'; 
          }
      }
  });


  
formVerificarTurno?.addEventListener('submit', (e) => {
    e.preventDefault();

    const numeroTicketRaw = numeroTicketInput?.value?.trim();
    const surtidorSeleccionadoNombre = selectSurtidorTurno?.value;
    const numeroTicketParsed = parseInt(numeroTicketRaw); 

    if (messageDiv) {
      messageDiv.textContent = '';
      messageDiv.className = '';
    }
    if (resultDiv) {
      resultDiv.textContent = '';
      resultDiv.className = '';
    }

    if (historyDiv && historyDiv.querySelector('.empty-history')) {
        historyDiv.innerHTML = '';
    }

    if (!numeroTicketRaw || isNaN(numeroTicketParsed) || numeroTicketParsed <= 0) {
      if (messageDiv) {
        messageDiv.textContent = 'Por favor ingrese un número de ticket válido (positivo).';
        messageDiv.className = 'invalid';
      }
      return;
    }

    if (!surtidorSeleccionadoNombre) {
      if (messageDiv) {
        messageDiv.textContent = 'Por favor seleccione un surtidor.';
        messageDiv.className = 'invalid';
      }
      return;
    }

    const surtidorSeleccionado = encontrarSurtidorPorNombre(surtidorSeleccionadoNombre);

    if (!surtidorSeleccionado) {
      if (messageDiv) {
        messageDiv.textContent = `Error: No se encontró el surtidor "${surtidorSeleccionadoNombre}".`;
        messageDiv.className = 'invalid';
      }
      return;
    }

    
    const resultadoVerificacion = verificarTurnoTicket(numeroTicketParsed, surtidorSeleccionadoNombre, tickets); 
    if (resultadoVerificacion.currentPosition === -1) {
        if (messageDiv) {
            messageDiv.textContent = `No se encontró el ticket #${numeroTicketParsed} para el surtidor "${surtidorSeleccionadoNombre}".`;
            messageDiv.className = 'invalid';
        }
        const errorEntry = document.createElement('div');
        errorEntry.className = 'history-entry failed'; 
        errorEntry.innerHTML = `
            <p><strong>Ticket #:</strong> ${numeroTicketParsed}</p>
            <p><strong>Surtidor:</strong> ${surtidorSeleccionadoNombre}</p>
            <p><strong>Fecha/Hora:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Razón:</strong> Ticket o Surtidor no encontrado.</p>
        `;
        if (historyDiv) {
            historyDiv.prepend(errorEntry); 
        }
        return;
    }

    if (messageDiv) {
        if (resultadoVerificacion.notificar) {
            messageDiv.textContent = resultadoVerificacion.message;
            messageDiv.className = 'valid';
        } else if (resultadoVerificacion.ticketStatus === TICKET_STATUS.CANCELADO || resultadoVerificacion.ticketStatus === TICKET_STATUS.COMPLETADO) {
            messageDiv.textContent = `El ticket #${numeroTicketParsed} tiene estado "${resultadoVerificacion.ticketStatus}". No es elegible para notificación de turno.`;
            messageDiv.className = 'info'; 
        } else if (resultadoVerificacion.totalWaiting === 0) {
            messageDiv.textContent = `El surtidor "${surtidorSeleccionadoNombre}" no tiene tickets en cola en estado "Generado".`;
            messageDiv.className = 'info';
        } else if (resultadoVerificacion.currentPosition > 0) {
            messageDiv.textContent = `Verificación completada. Ticket #${numeroTicketParsed} en posición ${resultadoVerificacion.currentPosition} de ${resultadoVerificacion.totalWaiting} en la cola.`;
            messageDiv.className = 'valid';
        } else {
            messageDiv.textContent = 'Verificación de turno completada.'; 
            messageDiv.className = 'valid';
        }
    }

    if (resultDiv) {
        
        const statusText = resultadoVerificacion.ticketStatus;
        const statusClass = `status-${statusText.replace(/ /g, '')}`;

        resultDiv.innerHTML = `
            <div class="result-content">
                <h4>Ticket #${numeroTicketParsed}</h4>
                <p><strong>Surtidor:</strong> ${surtidorSeleccionadoNombre}</p>
                <p><strong>Posición en cola:</strong> <span class="position">${resultadoVerificacion.currentPosition !== -1 ? resultadoVerificacion.currentPosition : 'N/A'}</span> de ${resultadoVerificacion.totalWaiting}</p>
                <p><strong>Estado:</strong> <span class="ticket-status ${statusClass}">${statusText}</span></p>
                ${resultadoVerificacion.notificar ? `<div class="notification">¡Atención! ${resultadoVerificacion.message}</div>` : ''}
            </div>
        `;
        resultDiv.className = 'report-output valid'; 


    if (resultadoVerificacion.notificar) {
        const notification = document.createElement('div');
        notification.className = 'floating-notification';
        notification.textContent = resultadoVerificacion.message; 
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000); 
    }

    formVerificarTurno.reset();
  }});

  actualizarVistaSurtidores();
    if (mensajeCapacidad) {
        mensajeCapacidad.textContent = 'Seleccione un surtidor para validar capacidad.';
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
    if (historyDiv) {
        historyDiv.innerHTML = '<p class="empty-history">No hay intentos fallidos de verificación.</p>';
    }

    renderTicketHistory();
    renderFailedCancellationHistory();

});