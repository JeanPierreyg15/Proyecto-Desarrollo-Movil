// Servicio de autenticación: se comunica con la API real (Backend-MovilLocker).
// Contrato devuelto por cada método:
//   { ok: true, ... }              -> éxito
//   { ok: false, mensaje }         -> fracaso controlado

import { apiRequest } from '../../../app/apiClient.js';
import { borrarToken, guardarToken, obtenerToken } from '../../../app/almacenamiento.js';
import { correoValido, passwordValida, obtenerIniciales } from '../../../app/validaciones.js';

/** Convierte un usuario de la API ({id, email, nombre, avatar_color, bio}) al formato de la app. */
export function mapearUsuario(usuarioApi) {
    return {
        id: usuarioApi.id,
        nombre: usuarioApi.nombre,
        correo: usuarioApi.email,
        avatarColor: usuarioApi.avatar_color ?? '#2563eb',
        bio: usuarioApi.bio ?? '',
        iniciales: obtenerIniciales(usuarioApi.nombre),
    };
}

async function usuarioAutenticado() {
    const resultado = await apiRequest('/auth/me');
    return resultado.ok ? mapearUsuario(resultado.datos) : null;
}

export const authService = {
    async iniciarSesion({ correo, password }) {
        if (!correo?.trim() || !password) {
            return { ok: false, mensaje: 'Por favor, ingrese sus datos' };
        }
        if (!correoValido(correo)) {
            return { ok: false, mensaje: 'Ingresa un correo válido' };
        }

        const resultado = await apiRequest('/auth/login', {
            metodo: 'POST',
            datos: { email: correo.trim().toLowerCase(), password },
            autenticado: false,
        });
        if (!resultado.ok) {
            return { ok: false, mensaje: resultado.mensaje };
        }

        // El backend devuelve el usuario junto al token (una sola petición)
        await guardarToken(resultado.datos.access_token);
        const usuario = resultado.datos.usuario
            ? mapearUsuario(resultado.datos.usuario)
            : await usuarioAutenticado();
        if (!usuario) {
            await borrarToken();
            return { ok: false, mensaje: 'No se pudo iniciar la sesión' };
        }
        return { ok: true, usuario };
    },

    async registrar({ nombre, correo, password }) {
        if (!nombre?.trim() || !correo?.trim() || !password) {
            return { ok: false, mensaje: 'Completa todos los campos' };
        }
        if (!correoValido(correo)) {
            return { ok: false, mensaje: 'Ingresa un correo válido' };
        }
        if (!passwordValida(password)) {
            return { ok: false, mensaje: 'La contraseña debe tener al menos 8 caracteres' };
        }

        const resultado = await apiRequest('/auth/register', {
            metodo: 'POST',
            datos: { nombre: nombre.trim(), email: correo.trim().toLowerCase(), password },
            autenticado: false,
        });
        if (!resultado.ok) {
            return { ok: false, mensaje: resultado.mensaje };
        }

        // Registro + login automático
        const guardadoAutomatico = await this.iniciarSesion({ correo, password });
        if (!guardadoAutomatico.ok) {
            return { ok: true, usuario: mapearUsuario(resultado.datos), sesionPendiente: true };
        }
        return guardadoAutomatico;
    },

    async solicitarRecuperacion({ correo }) {
        if (!correo?.trim()) {
            return { ok: false, mensaje: 'Ingresa tu correo electrónico' };
        }
        if (!correoValido(correo)) {
            return { ok: false, mensaje: 'Ingresa un correo válido' };
        }

        const resultado = await apiRequest('/auth/recuperar', {
            metodo: 'POST',
            datos: { email: correo.trim().toLowerCase() },
            autenticado: false,
        });
        if (!resultado.ok) {
            return { ok: false, mensaje: resultado.mensaje };
        }
        // Mensaje genérico del backend. En desarrollo local (DEBUG + loopback)
        // también llega el código; en producción se envía por email.
        return {
            ok: true,
            mensaje: resultado.datos.mensaje,
            codigoDesarrollo: resultado.datos.reset_token ?? null,
        };
    },

    async restablecerPassword({ token, password }) {
        if (!token?.trim()) {
            return { ok: false, mensaje: 'Pega el código que recibiste en tu correo' };
        }
        if (!passwordValida(password)) {
            return { ok: false, mensaje: 'La contraseña debe tener al menos 8 caracteres' };
        }

        const resultado = await apiRequest('/auth/restablecer', {
            metodo: 'POST',
            datos: { token: token.trim(), password },
            autenticado: false,
        });
        return resultado.ok ? { ok: true } : { ok: false, mensaje: resultado.mensaje };
    },

    async actualizarPerfil({ nombre, bio }) {
        const resultado = await apiRequest('/auth/perfil', {
            metodo: 'PUT',
            datos: { nombre, bio },
        });
        return resultado.ok
            ? { ok: true, usuario: mapearUsuario(resultado.datos) }
            : { ok: false, mensaje: resultado.mensaje };
    },

    async actualizarAvatar({ avatarColor }) {
        const resultado = await apiRequest('/auth/perfil', {
            metodo: 'PUT',
            datos: { avatar_color: avatarColor },
        });
        return resultado.ok
            ? { ok: true, usuario: mapearUsuario(resultado.datos) }
            : { ok: false, mensaje: resultado.mensaje };
    },

    async cambiarPassword({ passwordActual, passwordNueva }) {
        const resultado = await apiRequest('/auth/password', {
            metodo: 'PUT',
            datos: { password_actual: passwordActual, password_nueva: passwordNueva },
        });
        if (!resultado.ok) {
            return { ok: false, mensaje: resultado.mensaje };
        }
        // La sesión anterior queda invalidada: guardamos el token nuevo
        await guardarToken(resultado.datos.access_token);
        return { ok: true, mensaje: 'Contraseña actualizada con éxito.' };
    },

    async eliminarCuenta(password) {
        const resultado = await apiRequest('/auth/cuenta', {
            metodo: 'DELETE',
            datos: { password },
        });
        if (!resultado.ok) {
            return { ok: false, mensaje: resultado.mensaje };
        }
        await borrarToken();
        return { ok: true };
    },

    /** Restaura la sesión guardada al arrancar la app. */
    async restaurarSesion() {
        const token = await obtenerToken();
        if (!token) {
            return null;
        }
        const usuario = await usuarioAutenticado();
        if (usuario) {
            return usuario;
        }
        // Si fue un 401, apiClient ya borró el token. Si fue un fallo de red,
        // se conserva para poder reintentar en el próximo arranque.
        return null;
    },

    async cerrarSesion() {
        await borrarToken();
        return { ok: true };
    },
};
