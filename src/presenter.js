
import { reportarIngresoGasolina, consultarStock } from './stockCombustible.js';
import { agregarSurtidor } from './agregarSurtidor.js';
import { validarCapacidadSurtidor, CAPACIDAD_MAXIMA } from './capacidadSurtidor.js';


document.addEventListener('DOMContentLoaded', () => {

   
    const form = document.getElementById('Ingreso-form');
    const cantidadInput = document.getElementById('cantidad');
    const mensajeCapacidad = document.getElementById('mensaje-capacidad');
    const reporteDiv = document.getElementById('reporte-gasolina');
    const surtidorForm = document.getElementById('surtidor-form');
    const reporteSurtidores = document.getElementById('reporte-surtidores');
    const consultarStockBtn = document.getElementById('consultar-stock-btn');
    const resultadoStockDiv = document.getElementById('resultado-stock');
    const tipoCombustibleSelect = document.getElementById('tipo-combustible');
    const fechaInput = document.getElementById('fecha');
    const nombreSurtidorInput = document.getElementById('nombre-surtidor');
    const tipoSurtidorSelect = document.getElementById('tipo-surtidor');
    const tipoStockSelect = document.getElementById('tipo-stock');

  
    const surtidores = []; 

    
    if (mensajeCapacidad) {
       
        mensajeCapacidad.textContent = `Capacidad máxima: ${CAPACIDAD_MAXIMA} litros`;
    } else {
        console.error("Element with ID 'mensaje-capacidad' not found.");
    }

   
    if (cantidadInput && mensajeCapacidad) {
        cantidadInput.addEventListener('input', () => {
            const cantidadValue = cantidadInput.value.trim();
            let displayMessage = `Capacidad máxima: ${CAPACIDAD_MAXIMA} litros`; 

            if (cantidadValue === '') {
               
            } else {
                const cantidad = parseFloat(cantidadValue);
                
                if (!isNaN(cantidad)) {
                    
                    const validacion = validarCapacidadSurtidor(cantidad);
                    
                    displayMessage = validacion.message;
                } else {
                   
                    displayMessage = 'Por favor, ingrese un número válido.';
                }
            }
            mensajeCapacidad.textContent = displayMessage;
        });
    } else {
        if (!cantidadInput) console.error("Element with ID 'cantidad' not found.");
        
    }

   
    if (form && tipoCombustibleSelect && cantidadInput && fechaInput && reporteDiv && mensajeCapacidad) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 

           
            const tipo = tipoCombustibleSelect.value.trim();
            const cantidadStr = cantidadInput.value;
            const fecha = fechaInput.value;
            const cantidad = parseFloat(cantidadStr);

           
            if (isNaN(cantidad) || cantidad <= 0) {
                alert('Error: La cantidad debe ser un número positivo.');
                return; 
            }

          
            const validacionCapacidad = validarCapacidadSurtidor(cantidad);
            if (!validacionCapacidad.valid) { 
                
                alert(validacionCapacidad.message);
                return; 
            }

           
            const resultado = reportarIngresoGasolina(tipo, cantidad, fecha);

            
            if (resultado && resultado.success) {
                
                const entrada = document.createElement('p');
               
                entrada.textContent = `✔ Ingreso reportado: ${tipo}, ${cantidad} litros, fecha: ${fecha}`;
                reporteDiv.appendChild(entrada);

               
                form.reset();

               
                mensajeCapacidad.textContent = `Capacidad máxima: ${CAPACIDAD_MAXIMA} litros`;

            } else {
               
                alert(resultado?.message || 'Error al reportar el ingreso de gasolina.');
            }
        });
    } else {
       
        if (!form) console.error("Element with ID 'Ingreso-form' not found.");
        if (!tipoCombustibleSelect) console.error("Element with ID 'tipo-combustible' not found.");
        if (!cantidadInput) console.error("Element with ID 'cantidad' not found.");
        if (!fechaInput) console.error("Element with ID 'fecha' not found.");
        if (!reporteDiv) console.error("Element with ID 'reporte-gasolina' not found.");
        if (!mensajeCapacidad) console.error("Element with ID 'mensaje-capacidad' not found."); 
    }


    
    if (surtidorForm && nombreSurtidorInput && tipoSurtidorSelect) {
        surtidorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = nombreSurtidorInput.value.trim();
            const tipo = tipoSurtidorSelect.value.trim();

            
            if (!nombre || !tipo) {
                alert('Por favor, ingrese nombre y tipo para el surtidor.');
                return;
            }

            
            const resultado = agregarSurtidor(nombre, tipo);

           
            if (resultado && resultado.success && resultado.data) {
                surtidores.push(resultado.data); 
                actualizarVistaSurtidores();     
                surtidorForm.reset();             
                
                console.log(resultado.message || `Surtidor '${nombre}' agregado.`);
            } else {
                
                alert(resultado?.message || 'Error al agregar el surtidor.');
            }
            
        });
    } else {
        if (!surtidorForm) console.error("Element with ID 'surtidor-form' not found.");
        if (!nombreSurtidorInput) console.error("Element with ID 'nombre-surtidor' not found.");
        if (!tipoSurtidorSelect) console.error("Element with ID 'tipo-surtidor' not found.");
    }


    if (consultarStockBtn && tipoStockSelect && resultadoStockDiv) {
        consultarStockBtn.addEventListener('click', () => {
            const tipo = tipoStockSelect.value.trim();

            if (!tipo) {
                 resultadoStockDiv.textContent = 'Por favor, seleccione un tipo de combustible.';
                 return;
            }

            
            const cantidad = consultarStock(tipo);

           
            if (cantidad === null || typeof cantidad === 'undefined') {
                resultadoStockDiv.textContent = `No se encontró stock para "${tipo}" o ocurrió un error.`;
            } else {
                resultadoStockDiv.textContent = `Stock actual de "${tipo}": ${cantidad} litros.`;
            }
        });
    } else {
        if (!consultarStockBtn) console.error("Element with ID 'consultar-stock-btn' not found.");
        if (!tipoStockSelect) console.error("Element with ID 'tipo-stock' not found.");
        if (!resultadoStockDiv) console.error("Element with ID 'resultado-stock' not found.");
    }

   
    function actualizarVistaSurtidores() {
        if (reporteSurtidores) {
            
            reporteSurtidores.innerHTML = '<h3>Lista de Surtidores:</h3>' + surtidores.map(s =>
                `<p><strong>${s?.nombre || 'N/A'}</strong> - ${s?.tipoCombustible || 'N/A'}</p>`
            ).join('');
        } else {
            console.error("Element with ID 'reporte-surtidores' not found for updating list.");
        }
    }

    

});