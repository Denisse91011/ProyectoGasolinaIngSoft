let usuariosDB = []; // Asegúrate de inicializar usuariosDB

export function registroUsuario(nombre, correo, contrasena, tipoUsuario) {
  if (!nombre || !correo || !contrasena || !tipoUsuario) {
    return { success: false, message: 'Por favor, complete todos los campos.' };
  }

  // Validar que no haya otro usuario con el mismo correo
  const existeUsuario = usuariosDB.some(user => user.correo === correo);
  if (existeUsuario) {
    return { success: false, message: 'Este correo ya está registrado.' };
  }

  // Registrar nuevo usuario
  const nuevoUsuario = { nombre, correo, contrasena, tipoUsuario };
  usuariosDB.push(nuevoUsuario);
  return { success: true, message: 'Registro exitoso. Ahora puede iniciar sesión.' };
}
