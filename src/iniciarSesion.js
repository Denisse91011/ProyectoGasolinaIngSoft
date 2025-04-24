export function iniciarSesion(correo, contrasena, usuariosDB) {
  if (!correo || !contrasena) {
    return { success: false, message: 'Por favor, ingrese su correo y contraseña.' };
  }

  const usuario = usuariosDB.find(user => user.correo === correo);

  if (usuario && usuario.contrasena === contrasena) {
    return { success: true, message: 'Inicio de sesión exitoso. Bienvenido/a.' };
  } else {
    return { success: false, message: 'Contraseña incorrecta. Inténtelo nuevamente.' };
  }
}

