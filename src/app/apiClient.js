// Cliente HTTP central de la app.
// Todas las peticiones a la API pasan por aquí: URL base, token, timeout y
// notificación global de sesión expirada.

import { borrarToken, obtenerToken } from './almacenamiento.js';

// En web (Vite) apunta a tu PC. En emulador Android, usa 10.0.2.2 en lugar de
// localhost, y en un móvil físico la IP LAN de tu PC. Se configura en .env.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const TIEMPO_ESPERA_MS = 15000;

let manejadorNoAutorizado = null;

/** Registra una función (AuthContext) que se ejecutará cuando el token expire. */
export function configurarNoAutorizado(handler) {
    manejadorNoAutorizado = handler;
}

// Nombres de campo tal y como los ve la persona que usa la app.
const CAMPOS_ES = {
    url: 'URL',
    titulo: 'título',
    nombre: 'nombre',
    email: 'correo electrónico',
    password: 'contraseña',
    password_actual: 'contraseña actual',
    password_nueva: 'contraseña nueva',
    bio: 'biografía',
    avatar_color: 'color del avatar',
    tag_ids: 'etiquetas',
    token: 'código de recuperación',
    icono: 'icono',
};

function nombreCampo(loc = []) {
    const partes = loc.filter((parte) => parte !== 'body' && parte !== 'query' && parte !== 'path');
    const campo = partes.length > 0 ? String(partes[partes.length - 1]) : '';
    return CAMPOS_ES[campo] ?? campo.replace(/_/g, ' ');
}

/** Convierte el `detail` de la API en un mensaje legible en español. */
export function extraerMensaje(cuerpo) {
    const detalle = cuerpo?.detail;
    if (typeof detalle === 'string') {
        return detalle;
    }
    // FastAPI devuelve errores de validación (422) como array.
    if (Array.isArray(detalle)) {
        return detalle
            .map((error) => {
                const campo = nombreCampo(error.loc ?? []);
                // El backend ya redacta frases completas en español; en ese caso
                // no hay que volver a anteponer el nombre del campo.
                const mensaje = String(error.msg ?? '')
                    .replace(/^Value error,\s*/i, '')
                    .trim();
                if (!campo || !mensaje) {
                    return mensaje || campo;
                }
                return mensaje.toLowerCase().includes(campo.toLowerCase())
                    ? mensaje
                    : `${campo}: ${mensaje}`;
            })
            .filter(Boolean)
            .join(' · ');
    }
    return 'Ocurrió un error inesperado';
}

/**
 * Realiza una petición a la API.
 * Siempre devuelve un objeto con esta forma:
 *   { ok: true, datos: <cuerpo>, estado }
 *   { ok: false, mensaje, estado }
 */
export async function apiRequest(ruta, { metodo = 'GET', datos = undefined, autenticado = true } = {}) {
    const cabeceras = { 'Content-Type': 'application/json' };

    if (autenticado) {
        const token = await obtenerToken();
        if (token) {
            cabeceras.Authorization = `Bearer ${token}`;
        }
    }

    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), TIEMPO_ESPERA_MS);

    let respuesta;
    try {
        respuesta = await fetch(`${API_URL}${ruta}`, {
            method: metodo,
            headers: cabeceras,
            body: datos !== undefined ? JSON.stringify(datos) : undefined,
            signal: control.signal,
        });
    } catch (error) {
        if (error?.name === 'AbortError') {
            return { ok: false, mensaje: 'El servidor tardó demasiado en responder. Inténtalo de nuevo.', estado: 0 };
        }
        return { ok: false, mensaje: 'No hay conexión con el servidor. Verifica tu red e inténtalo de nuevo.', estado: 0 };
    } finally {
        clearTimeout(temporizador);
    }

    if (respuesta.status === 204) {
        return { ok: true, datos: null, estado: 204 };
    }

    let cuerpo = null;
    try {
        cuerpo = await respuesta.json();
    } catch {
        /* respuesta sin cuerpo JSON */
    }

    if (!respuesta.ok) {
        if (respuesta.status === 401 && autenticado) {
            // Token inválido o expirado: se limpia la sesión y se avisa a la app
            await borrarToken();
            manejadorNoAutorizado?.();
        }
        return { ok: false, mensaje: extraerMensaje(cuerpo), estado: respuesta.status };
    }

    return { ok: true, datos: cuerpo, estado: respuesta.status };
}
