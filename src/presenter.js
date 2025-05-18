// src/presenter.js
import { surtidor, CAPACIDAD_MAXIMA } from './surtidor.js';
import { generarTicketCarga } from './usuario.js';


const surtidores = [];

document.addEventListener('DOMContentLoaded', () => {
  // --- Referencias a elementos HTML existentes ---
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

 // --- Referencias a NUEVOS elementos HTML para el Ticket ---
  const ticketForm = document.getElementById('ticket-form');
  const selectSurtidorTicket = document.getElementById('select-surtidor-ticket'); // Select de surtidor para ticket
  const ticketCantidadInput = document.getElementById('ticket-cantidad');
  const ticketCantidadMensajeDiv = document.getElementById('ticket-cantidad-mensaje'); // Div para mensaje de cantidad del ticket
  const ticketFechaInput = document.getElementById('ticket-fecha');
  const ticketPlacaInput = document.getElementById('ticket-placa');
  const ticketResultadoDiv = document.getElementById('ticket-resultado'); 
  const ticketHistoryDiv = document.getElementById('ticket-history'); 

  // --- Funciones existentes ---
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
       const selectsToUpdate = [selectSurtidorIngreso, selectSurtidorStock, selectSurtidorEstimacion, selectSurtidorTicket];

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


     
      const resultado = generarTicketCarga(tipo, cantidad, fecha, placa);

      if (ticketResultadoDiv) { 
          if (resultado.success) {
              const ticket = resultado.ticket;

              const ticketHTML = `
                  <div class="ticket-entry">
                      <h3>Ticket #${ticket.numeroTicket}</h3>
                       <div class="ticket-inline-info">
                           <p><strong>Surtidor:</strong> ${surtidorSeleccionado.nombre}</p>
                           <p><strong>Tipo:</strong> ${ticket.tipoCombustible}</p>
                       </div>
                       <div class="ticket-inline-info">
                           <p><strong>Cantidad:</strong> ${ticket.cantidadCargada} l</p>
                           <p><strong>Fecha/Hora:</strong> ${ticket.fechaHora}</p>
                       </div>
                      <p><strong>Placa:</strong> ${ticket.placaVehiculo}</p>
                  </div>
              `;

              ticketResultadoDiv.innerHTML = ticketHTML;
               ticketResultadoDiv.className = 'report-output valid'; 

              if (ticketHistoryDiv) {
                  if (ticketHistoryDiv.textContent.includes('No se han generado tickets aún.')) {
                      ticketHistoryDiv.innerHTML = '';
                  }
                  const historyEntryElement = document.createElement('div');
                   historyEntryElement.classList.add('ticket-history'); 
                  historyEntryElement.innerHTML = ticketHTML; 
                  ticketHistoryDiv.prepend(historyEntryElement);
              }

              ticketForm.reset(); 
              if (ticketCantidadMensajeDiv) ticketCantidadMensajeDiv.textContent = ''; 
          } else {
              ticketResultadoDiv.textContent = `Error: ${resultado.message}`;
               ticketResultadoDiv.className = 'report-output invalid'; 
          }
      }
  });


  actualizarVistaSurtidores(); 
    if (mensajeCapacidad) {
        mensajeCapacidad.textContent = 'Seleccione un surtidor para validar capacidad.'; 
         mensajeCapacidad.className = '';
    }
    if (ticketCantidadMensajeDiv) {
        ticketCantidadMensajeDiv.textContent = ''; 
         ticketCantidadMensajeDiv.className = '';
    }
    if (ticketHistoryDiv && ticketHistoryDiv.innerHTML.trim() === '') {
         ticketHistoryDiv.innerHTML = '<p>No se han generado tickets aún.</p>';
    }


}); 