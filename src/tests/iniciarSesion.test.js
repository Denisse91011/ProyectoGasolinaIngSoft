import { iniciarSesion } from '../iniciarSesion';

describe('Función de inicio de sesión', () => {

  const usuariosDB = [
    { correo: 'usuario@ejemplo.com', contrasena: '12345' },
    { correo: 'operario@ejemplo.com', contrasena: 'password123' }
  ];

  it('debería mostrar "Inicio de sesión exitoso. Bienvenido/a." cuando el correo y la contraseña son correctos', () => {
    const resultado = iniciarSesion('usuario@ejemplo.com', '12345', usuariosDB);
    expect(resultado.success).toBe(true);
    expect(resultado.message).toBe('Inicio de sesión exitoso. Bienvenido/a.');
  });

  it('debería mostrar "Contraseña incorrecta. Inténtelo nuevamente." cuando el correo es correcto pero la contraseña es incorrecta', () => {
    const resultado = iniciarSesion('usuario@ejemplo.com', 'wrongpassword', usuariosDB);
    expect(resultado.success).toBe(false);
    expect(resultado.message).toBe('Contraseña incorrecta. Inténtelo nuevamente.');
  });

  it('debería mostrar "Por favor, ingrese su correo y contraseña." cuando el correo o la contraseña están vacíos', () => {
    const resultado1 = iniciarSesion('', '12345', usuariosDB);
    expect(resultado1.success).toBe(false);
    expect(resultado1.message).toBe('Por favor, ingrese su correo y contraseña.');
    const resultado2 = iniciarSesion('usuario@ejemplo.com', '', usuariosDB);
    expect(resultado2.success).toBe(false);
    expect(resultado2.message).toBe('Por favor, ingrese su correo y contraseña.');
  });
});

