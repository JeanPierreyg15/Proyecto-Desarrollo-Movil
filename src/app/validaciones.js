// Validaciones y utilidades compartidas por todas las features.
// (antes estas reglas estaban copiadas y pegadas en 5+ archivos)

export const correoValido = (correo = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo).trim());

export const passwordValida = (password = '') => String(password ?? '').length >= 6;

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
