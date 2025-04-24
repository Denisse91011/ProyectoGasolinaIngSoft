import { registroUsuario } from '../registroUsuario';

describe('Registro de Usuario (Conductor y Operario)', () => {

    it('debería registrar exitosamente un conductor', () => {
      const resultado = registroUsuario('Ana', 'ana@mail.com', '123456', 'Conductor');
      expect(resultado).toBe('Registro exitoso. Ahora puede iniciar sesión.');
    });
    it('debería registrar exitosamente un operario', () => {
        const resultado = registroUsuario('Carlos', 'carlos@mail.com', 'clave123', 'Operario');
        expect(resultado).toBe('Registro exitoso. Ahora puede iniciar sesión.');
      });
    it('debería mostrar error si falta el nombre', () => {
        const resultado = registroUsuario('', 'pepe@mail.com', 'abc123', 'Conductor');
        expect(resultado).toBe('Por favor, complete todos los campos.');
    });
  });