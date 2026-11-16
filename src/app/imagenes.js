// Utilidades de imagen para la foto de perfil.
// La foto se recorta al centro (cuadrada) y se reduce en el propio dispositivo
// antes de subirla: así se envían ~20 KB en lugar de varios MB de la cámara.

export const LADO_FOTO_PERFIL = 256;
export const TAMANO_MAXIMO_ARCHIVO = 15 * 1024 * 1024; // 15 MB antes de reducir

function cargarImagen(archivo) {
    return new Promise((resolver, rechazar) => {
        const url = URL.createObjectURL(archivo);
        const imagen = new Image();
        imagen.onload = () => {
            URL.revokeObjectURL(url);
            resolver(imagen);
        };
        imagen.onerror = () => {
            URL.revokeObjectURL(url);
            rechazar(new Error('No se pudo leer la imagen.'));
        };
        imagen.src = url;
    });
}

/**
 * Convierte el archivo elegido en una data URL JPEG cuadrada de `lado` píxeles.
 * Devuelve { ok: true, datos: 'data:image/jpeg;base64,...' } o { ok: false, mensaje }.
 */
export async function prepararFotoPerfil(archivo, lado = LADO_FOTO_PERFIL) {
    if (!archivo) {
        return { ok: false, mensaje: 'No se seleccionó ninguna imagen.' };
    }
    if (!archivo.type?.startsWith('image/')) {
        return { ok: false, mensaje: 'El archivo elegido no es una imagen.' };
    }
    if (archivo.size > TAMANO_MAXIMO_ARCHIVO) {
        return { ok: false, mensaje: 'La imagen es demasiado grande (máximo 15 MB).' };
    }

    let imagen;
    try {
        imagen = await cargarImagen(archivo);
    } catch {
        return { ok: false, mensaje: 'No se pudo leer la imagen. Prueba con otra foto.' };
    }

    const ancho = imagen.naturalWidth || imagen.width;
    const alto = imagen.naturalHeight || imagen.height;
    if (!ancho || !alto) {
        return { ok: false, mensaje: 'No se pudo leer la imagen. Prueba con otra foto.' };
    }

    // Recorte centrado al cuadrado más grande posible.
    const corte = Math.min(ancho, alto);
    const origenX = (ancho - corte) / 2;
    const origenY = (alto - corte) / 2;

    const lienzo = document.createElement('canvas');
    lienzo.width = lado;
    lienzo.height = lado;
    const contexto = lienzo.getContext('2d');
    if (!contexto) {
        return { ok: false, mensaje: 'Tu dispositivo no permite procesar la imagen.' };
    }
    // Fondo blanco: un PNG con transparencia no queda negro al pasar a JPEG.
    contexto.fillStyle = '#ffffff';
    contexto.fillRect(0, 0, lado, lado);
    contexto.imageSmoothingQuality = 'high';
    contexto.drawImage(imagen, origenX, origenY, corte, corte, 0, 0, lado, lado);

    return { ok: true, datos: lienzo.toDataURL('image/jpeg', 0.85) };
}
