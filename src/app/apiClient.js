// Cliente HTTP central de la app.
// Todas las peticiones a la API pasan por aquí: URL base, token y mensajes de error.

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const CLAVE_TOKEN = 'locker-token';

export function obtenerToken() {
    try {
        return localStorage.getItem(CLAVE_TOKEN);
    } catch {
        return null;
    }
}

export function guardarToken(token) {
    try {
        localStorage.setItem(CLAVE_TOKEN, token);
    } catch {
        /* almacenamiento no disponible */
    }
}

export function borrarToken() {
    try {
        localStorage.removeItem(CLAVE_TOKEN);
    } catch {
        /* almacenamiento no disponible */
    }
}

function extraerMensaje(cuerpo) {
    const detalle = cuerpo?.detail;
    if (typeof detalle === 'string') {
        return detalle;
    }
    // FastAPI devuelve errores de validación (422) como array
    if (Array.isArray(detalle)) {
        return detalle
            .map((error) => `${(error.loc ?? []).slice(1).join('.')}: ${error.msg}`)
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

    const token = obtenerToken();
    if (autenticado && token) {
        cabeceras.Authorization = `Bearer ${token}`;
    }

    let respuesta;
    try {
        respuesta = await fetch(`${API_URL}${ruta}`, {
            method: metodo,
            headers: cabeceras,
            body: datos !== undefined ? JSON.stringify(datos) : undefined,
        });
    } catch {
        return { ok: false, mensaje: 'No hay conexión con el servidor. Verifica que el backend esté corriendo.', estado: 0 };
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
            // Token inválido o expirado: se limpia la sesión
            borrarToken();
        }
        return { ok: false, mensaje: extraerMensaje(cuerpo), estado: respuesta.status };
    }

    return { ok: true, datos: cuerpo, estado: respuesta.status };
}
