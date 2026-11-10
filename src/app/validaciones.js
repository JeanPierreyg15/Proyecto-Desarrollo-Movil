// Validaciones y utilidades compartidas por todas las features.

export const LONGITUD_MINIMA_PASSWORD = 8;

export const correoValido = (correo = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo).trim());

export const passwordValida = (password = '') =>
    String(password ?? '').length >= LONGITUD_MINIMA_PASSWORD;

/** Añade https:// si falta y rechaza esquemas peligrosos (javascript:, data:, ...). */
export function normalizarUrl(valor = '') {
    const texto = String(valor).trim();
    if (!texto) {
        return '';
    }
    const esquema = texto.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
    if (esquema && !['http', 'https'].includes(esquema[1].toLowerCase())) {
        return '';
    }
    return /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;
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
