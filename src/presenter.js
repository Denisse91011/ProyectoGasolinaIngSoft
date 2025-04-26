import './iniciarSesion.js'
import './registroUsuario.js'
import './solicitarTicketCarga'
import './reportarIngresoGasolina'
import {iniciarSesion} from './iniciarSesion.js'
import { registroUsuario } from './registroUsuario.js';



document.addEventListener('DOMContentLoaded',()=>{
    const Registroform = document.getElementById('registro-form');
    const loginForm = document.getElementById('login-form');
    const resultadoDiv = document.getElementById('resultado-div');

    const usuariosDB =[];
    
    if(registroForm){
    Registroform.addEventListener('submit' , (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const correo = document.getEelementById('correo').value;
        const contrasena = document.getElementById('constrasena').value;
        const tipoUsuario = document.getElementById('tipo-usuario').value;

        const resultado = registroUsuario(nombre,correo,contrasena,tipoUsuario);

        if(resultado === 'Registro exitoso , Ahora puede iniciar sesion'){
            usuariosDB.push({nombre,correo,contrasena,tipoUsuario});
        }

        resultadoDiv.textContent = resultado;
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const correo = document.getElementById('login-correo').value;
      const contrasena = document.getElementById('login-contrasena').value;

      const resultado = iniciarSesion(correo, contrasena, usuariosDB);
      resultadoDiv.textContent = resultado.message;
    });
  }


})