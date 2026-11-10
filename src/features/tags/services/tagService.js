// Servicio de etiquetas: se comunica con la API real (Backend-MovilLocker).
//   GET    /tags/       -> listar etiquetas del usuario autenticado
//   POST   /tags/       -> crear etiqueta { nombre, icono }
//   PUT    /tags/{id}   -> renombrar / cambiar icono
//   DELETE /tags/{id}   -> eliminar etiqueta (los links se conservan)

import { apiRequest } from '../../../app/apiClient.js';

const ICONO_POR_DEFECTO = '🏷️';

/** Convierte una etiqueta de la API al formato que usan las vistas. */
function mapearEtiqueta(tagApi) {
    const nombre = tagApi.nombre ?? '';
    return {
        id: tagApi.id,
        nombre,
        titulo: nombre,
        icono: tagApi.icono || ICONO_POR_DEFECTO,
    };
}

export const tagService = {
    async listar() {
        const resultado = await apiRequest('/tags/');
        if (!resultado.ok) {
            return resultado;
        }
        return { ok: true, datos: (resultado.datos ?? []).map(mapearEtiqueta) };
    },

    async crear({ nombre, icono } = {}) {
        if (!nombre?.trim()) {
            return { ok: false, mensaje: 'Escribe un nombre para la etiqueta.' };
        }
        const resultado = await apiRequest('/tags/', {
            metodo: 'POST',
            datos: { nombre: nombre.trim(), icono: icono || ICONO_POR_DEFECTO },
        });
        if (!resultado.ok) {
            return resultado;
        }
        return { ok: true, datos: mapearEtiqueta(resultado.datos) };
    },

    async actualizar(id, { nombre, icono } = {}) {
        if (!nombre?.trim()) {
            return { ok: false, mensaje: 'Escribe un nombre para la etiqueta.' };
        }
        const resultado = await apiRequest(`/tags/${id}`, {
            metodo: 'PUT',
            datos: { nombre: nombre.trim(), icono: icono || ICONO_POR_DEFECTO },
        });
        if (!resultado.ok) {
            return resultado;
        }
        return { ok: true, datos: mapearEtiqueta(resultado.datos) };
    },

    async eliminar(id) {
        const resultado = await apiRequest(`/tags/${id}`, { metodo: 'DELETE' });
        if (!resultado.ok) {
            return resultado;
        }
        return { ok: true };
    },
};
