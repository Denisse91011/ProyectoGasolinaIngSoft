import { iniciarSesion } from './iniciarSesion.js';
import { registroUsuario } from './registroUsuario.js';
import { reportarIngresoGasolina } from './reportarIngresoGasolina.js';

document.addEventListener('DOMContentLoaded', () => {
  const registroForm = document.getElementById('registro-form');
  const loginForm = document.getElementById('login-form');
  const resultadoDiv = document.getElementById('resultado-div');
  const ingresoForm = document.getElementById('Ingreso-form');
  const mostrarUsuariosBtn = document.getElementById('mostrar-usuarios');
  const usuariosLista = document.getElementById('usuarios-lista');

  let usuariosDB = JSON.parse(localStorage.getItem('usuariosDB')) || [];
  let usuarioActual = null;

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
      resultadoDiv.textContent = resultado.message;
    });
  }

  if (mostrarUsuariosBtn) {
    mostrarUsuariosBtn.addEventListener('click', () => {
      renderizarUsuarios();
    });
  }

  renderizarUsuarios();
});

