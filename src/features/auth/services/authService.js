// Servicio de autenticación: se comunica con la API real (Backend-MovilLocker).
// Contrato devuelto por cada método:
//   { ok: true, ... }              -> éxito
//   { ok: false, mensaje }         -> fracaso controlado

import { apiRequest, guardarToken, borrarToken, obtenerToken } from '../../../app/apiClient.js';
import { correoValido, passwordValida, obtenerIniciales } from '../../../app/validaciones.js';

/** Convierte un usuario de la API ({id, email, nombre, avatar_color}) al formato de la app. */
export function mapearUsuario(usuarioApi) {
    return {
        id: usuarioApi.id,
        nombre: usuarioApi.nombre,
        correo: usuarioApi.email,
        avatarColor: usuarioApi.avatar_color ?? '#2563eb',
        iniciales: obtenerIniciales(usuarioApi.nombre),
    };
}

/** Solicita los datos del usuario autenticado (usando el token ya guardado). */
async function usuarioAutenticado() {
    const resultado = await apiRequest('/auth/me');
    if (!resultado.ok) {
        return null;
    }
    return mapearUsuario(resultado.datos);
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

        guardarToken(resultado.datos.access_token);
        const usuario = await usuarioAutenticado();
        if (!usuario) {
            borrarToken();
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
            return { ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
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
        return { ok: true, token: resultado.datos.reset_token };
    },

    async restablecerPassword({ token, password }) {
        if (!token) {
            return { ok: false, mensaje: 'Solicitud de recuperación no válida, empieza de nuevo' };
        }
        if (!passwordValida(password)) {
            return { ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
        }

        const resultado = await apiRequest('/auth/restablecer', {
            metodo: 'POST',
            datos: { token, password },
            autenticado: false,
        });
        if (!resultado.ok) {
            return { ok: false, mensaje: resultado.mensaje };
        }
        return { ok: true };
    },

    async actualizarPerfil({ nombre }) {
        const resultado = await apiRequest('/auth/perfil', {
            metodo: 'PUT',
            datos: { nombre },
        });
        if (!resultado.ok) {
            return { ok: false, mensaje: resultado.mensaje };
        }
        return { ok: true, usuario: mapearUsuario(resultado.datos) };
    },

    async actualizarAvatar({ avatarColor }) {
        const resultado = await apiRequest('/auth/perfil', {
            metodo: 'PUT',
            datos: { avatar_color: avatarColor },
        });
        if (!resultado.ok) {
            return { ok: false, mensaje: resultado.mensaje };
        }
        return { ok: true, usuario: mapearUsuario(resultado.datos) };
    },

    async eliminarCuenta() {
        const resultado = await apiRequest('/auth/cuenta', { metodo: 'DELETE' });
        if (!resultado.ok) {
            return { ok: false, mensaje: resultado.mensaje };
        }
        borrarToken();
        return { ok: true };
    },

    /** Restaura la sesión guardada (se llama al arrancar la app). */
    async restaurarSesion() {
        const token = obtenerToken();
        if (!token) {
            return null;
        }

        const usuario = await usuarioAutenticado();
        if (usuario) {
            return usuario;
        }

        // Token inválido/expirado → se limpia la sesión
        borrarToken();
        return null;
    },

    async cerrarSesion() {
        borrarToken();
        return { ok: true };
    },
};
