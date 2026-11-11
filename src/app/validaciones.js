// Validaciones y utilidades compartidas por todas las features.

export const LONGITUD_MINIMA_PASSWORD = 8;
export const LONGITUD_MAXIMA_BYTES_PASSWORD = 72;
export const LONGITUD_MAXIMA_URL = 2048;

export const correoValido = (correo = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo).trim());

/** Bytes UTF-8 de una contraseña (bcrypt trunca a 72 bytes, no caracteres). */
export const bytesDePassword = (password = '') =>
    new TextEncoder().encode(String(password ?? '')).length;

export const passwordValida = (password = '') => {
    const texto = String(password ?? '');
    return (
        texto.length >= LONGITUD_MINIMA_PASSWORD &&
        bytesDePassword(texto) <= LONGITUD_MAXIMA_BYTES_PASSWORD
    );
};

/** Mensaje de error de contraseña coherente con el backend (8 caracteres / 72 bytes). */
export function errorPassword(password = '') {
    const texto = String(password ?? '');
    if (texto.length < LONGITUD_MINIMA_PASSWORD) {
        return `Usa al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`;
    }
    if (bytesDePassword(texto) > LONGITUD_MAXIMA_BYTES_PASSWORD) {
        return 'La contraseña no puede superar 72 bytes (la ñ, á, é… ocupan más de un byte).';
    }
    return '';
}

/** Añade https:// si falta y rechaza esquemas peligrosos (javascript:, data:, ...). */
export function normalizarUrl(valor = '') {
    const texto = String(valor ?? '').trim();
    if (!texto || texto.length > LONGITUD_MAXIMA_URL) {
        return '';
    }

    let candidato = texto;
    const esquema = texto.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):([\s\S]*)$/);
    if (esquema) {
        const nombre = esquema[1].toLowerCase();
        const resto = esquema[2];
        if (nombre === 'http' || nombre === 'https') {
            candidato = texto;
        } else if (/^\d{1,5}([/?#]|$)/.test(resto)) {
            // host:puerto sin esquema (localhost:3000, midominio.com:8080/ruta)
            candidato = `https://${texto}`;
        } else {
            return '';
        }
    }

    const conEsquema = /^https?:\/\//i.test(candidato) ? candidato : `https://${candidato}`;
    try {
        const url = new URL(conEsquema);
        if (!['http:', 'https:'].includes(url.protocol)) {
            return '';
        }
        // `new URL` acepta https://user@ y https://. ; exigimos un hostname real.
        if (!url.hostname || /^\.+$/.test(url.hostname)) {
            return '';
        }
        // Canonicalización idéntica al backend: sin :80/:443, sin #fragmento y
        // sin la / final cuando la ruta es solo la raíz. Así la vista previa
        // detecta los mismos duplicados que la API.
        const ruta = url.pathname === '/' ? '' : url.pathname;
        return `${url.origin}${ruta}${url.search}`;
    } catch {
        return '';
    }
}

/** Extrae el dominio legible de una URL (sin www). */
export function dominioDeUrl(valor = '') {
    const texto = String(valor).trim();
    if (!texto) {
        return '';
    }
    try {
        const url = new URL(/^https?:\/\//i.test(texto) ? texto : `https://${texto}`);
        return url.hostname.replace(/^www\./i, '');
    } catch {
        return texto;
    }
}

/** URL del favicon del sitio (servicio público de Google). Null si no hay dominio válido. */
export function faviconDeUrl(valor = '') {
    const dominio = dominioDeUrl(valor);
    if (!dominio || !dominio.includes('.')) {
        return null;
    }
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(dominio)}&sz=64`;
}

export function obtenerIniciales(nombre = '') {
    const letras = nombre
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((parte) => parte[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    return letras || '?';
}

/**
 * SQLite no guarda zona horaria: "2026-11-09T12:00:00" es UTC, pero
 * `new Date()` lo interpretaría como hora local. Si falta la zona, se añade Z.
 */
function comoUtc(fechaISO) {
    const texto = String(fechaISO).trim();
    const tieneHora = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(texto);
    const tieneZona = /(Z|[+-]\d{2}:?\d{2})$/i.test(texto);
    if (tieneHora && !tieneZona) {
        return `${texto.replace(' ', 'T')}Z`;
    }
    return texto;
}

/** Devuelve un texto tipo "hace 5 min" a partir de una fecha ISO. */
export function tiempoRelativo(fechaISO) {
    if (!fechaISO) {
        return null;
    }
    const fecha = new Date(comoUtc(fechaISO));
    if (Number.isNaN(fecha.getTime())) {
        return null;
    }
    const segundos = Math.round((fecha.getTime() - Date.now()) / 1000);
    const absoluto = Math.abs(segundos);
    const formato = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

    if (absoluto < 60) {
        return 'hace un momento';
    }
    if (absoluto < 3600) {
        return formato.format(Math.round(segundos / 60), 'minute');
    }
    if (absoluto < 86400) {
        return formato.format(Math.round(segundos / 3600), 'hour');
    }
    if (absoluto < 2592000) {
        return formato.format(Math.round(segundos / 86400), 'day');
    }
    return formato.format(Math.round(segundos / 2592000), 'month');
}
