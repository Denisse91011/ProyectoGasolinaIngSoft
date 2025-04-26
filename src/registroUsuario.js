export function registroUsuario(nombre, correo, contraseña, tipoUsuario) {
    if (!nombre || !correo || !contraseña || !tipoUsuario) {
      return 'Por favor, complete todos los campos.';
    }
    const tiposValidos = ['Conductor', 'Operario'];
    if (!tiposValidos.includes(tipoUsuario)) {
      return 'Tipo de usuario inválido. Debe ser Conductor u Operario.';
    }
    return 'Registro exitoso. Ahora puede iniciar sesión.';
  }
  