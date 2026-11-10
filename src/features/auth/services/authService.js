// Servicio de autenticación: se comunica con la API real (Backend-MovilLocker).
// Contrato devuelto por cada método:
//   { ok: true, ... }              -> éxito
//   { ok: false, mensaje, noImplementado? } -> fracaso controlado

import { apiRequest, guardarToken, borrarToken, obtenerToken } from '../../../app/apiClient.js';
import { correoValido, passwordValida, obtenerIniciales } from '../../../app/validaciones.js';

/** Convierte un usuario de la API ({id, email, nombre}) al formato que usa la app. */
export function mapearUsuario(usuarioApi) {
    return {
        id: usuarioApi.id,
        nombre: usuarioApi.nombre,
        correo: usuarioApi.email,
        iniciales: obtenerIniciales(usuarioApi.nombre),
        avatarColor: '#2563eb',
    };
}

/** Lee el payload del JWT (parte intermedia) para recuperar el correo de la sesión. */
export function usuarioDesdeToken(token) {
    try {
        const carga = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(carga));
        const correo = payload?.sub ?? '';
        if (!correo) {
            return null;
        }
        const nombre = correo.split('@')[0];
        return {
            correo,
            nombre,
            iniciales: obtenerIniciales(nombre),
            avatarColor: '#2563eb',
        };
    } catch {
        return null;
    }
}

const NO_IMPLEMENTADO = { ok: false, noImplementado: true, mensaje: 'Esta función todavía no está disponible en el servidor.' };

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
        return { ok: true, usuario: usuarioDesdeToken(resultado.datos.access_token) };
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

        const guardadoAutomatico = await this.iniciarSesion({ correo, password });
        if (!guardadoAutomatico.ok) {
            return { ok: true, usuario: mapearUsuario(resultado.datos), sesionPendiente: true };
        }
        return guardadoAutomatico;
    },

    async solicitarRecuperacion({ correo }) {
        if (!correo?.trim()) {
            return NO_IMPLEMENTADO;
        }
        if (!correoValido(correo)) {
            return NO_IMPLEMENTADO;
        }
        // El backend aún no expone un endpoint de recuperación con envío de correo.
        return NO_IMPLEMENTADO;
    },

    async restablecerPassword() {
        // El backend aún no expone un endpoint para restablecer la contraseña.
        return NO_IMPLEMENTADO;
    },

    async actualizarPerfil() {
        // El backend aún no expone un endpoint de edición de perfil (PUT /users/me).
        return NO_IMPLEMENTADO;
    },

    async actualizarAvatar() {
        // El color del avatar es un dato local; el backend aún no lo almacena.
        return { ok: true };
    },

    /** Restaura la sesión guardada (se llama al arrancar la app). */
    async restaurarSesion() {
        const token = obtenerToken();
        if (!token) {
            return null;
        }

        const usuario = usuarioDesdeToken(token);
        if (!usuario) {
            borrarToken();
            return null;
        }

        // Validamos que el token siga vigente con una petición ligera.
        const resultado = await apiRequest('/links/');
        if (resultado.ok) {
            return usuario;
        }
        if (resultado.estado === 401) {
            borrarToken();
            return null;
        }
        // Error de red o servidor caído: mantenemos la sesión local para no expulsar al usuario.
        return usuario;
    },

    async cerrarSesion() {
        borrarToken();
        return { ok: true };
    },
};
