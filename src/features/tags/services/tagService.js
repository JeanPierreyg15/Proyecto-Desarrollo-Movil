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
        cantidad: tagApi.links_count ?? 0,
    };
}

export const tagService = {
    async listar({ skip = 0, limit = 200 } = {}) {
        const parametros = new URLSearchParams({ skip: String(skip), limit: String(limit) });
        const resultado = await apiRequest(`/tags/?${parametros}`);
        if (!resultado.ok) {
            return resultado;
        }
        return { ok: true, datos: (resultado.datos ?? []).map(mapearEtiqueta) };
    },

    /** Total de etiquetas del usuario, sin el límite de la paginación. */
    async contar() {
        const resultado = await apiRequest('/tags/count');
        if (!resultado.ok) {
            return resultado;
        }
        return { ok: true, datos: resultado.datos?.count ?? 0 };
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
