import './iniciarSesion'
import { registroUsuario } from './registroUsuario.js';
import './solicitarTicketCarga'
import './reportarIngresoGasolina'


document.addEventListener('DOMContentLoaded',()=>{
    const form = document.getElementById('registro-form');
    const resultadoDiv = document.getElementById('resultado-div');

    form.addEventListener('submit' , (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const correo = document.getEelementById('correo').value;
        const contrasena = document.getElementById('constrasena').value;
        const tipoUsuario = document.getElementById('tipo-usuario').value;

        const resultado = registroUsuario(nombre,correo,contrasena,tipoUsuario);
        resultadoDiv.textContent = resultado;
    })
})