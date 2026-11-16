// Servicio de etiquetas: se comunica con la API real (Backend-MovilLocker).
//   GET    /tags/       -> listar etiquetas del usuario autenticado
//   POST   /tags/       -> crear etiqueta { nombre, icono }
//   PUT    /tags/{id}   -> renombrar / cambiar icono
//   DELETE /tags/{id}   -> eliminar etiqueta (los links se conservan)
//
// Cada cambio emite EVENTOS.ETIQUETAS_CAMBIADAS para que Inicio y Perfil se
// actualicen sin tener que refrescar la página.

import { apiRequest } from '../../../app/apiClient.js';
import { EVENTOS, emitir } from '../../../app/eventos.js';

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
        const etiqueta = mapearEtiqueta(resultado.datos);
        emitir(EVENTOS.ETIQUETAS_CAMBIADAS, { tipo: 'creada', etiqueta });
        return { ok: true, datos: etiqueta };
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
        const etiqueta = mapearEtiqueta(resultado.datos);
        emitir(EVENTOS.ETIQUETAS_CAMBIADAS, { tipo: 'actualizada', etiqueta });
        return { ok: true, datos: etiqueta };
    },

    async eliminar(id) {
        const resultado = await apiRequest(`/tags/${id}`, { metodo: 'DELETE' });
        if (!resultado.ok) {
            return resultado;
        }
        emitir(EVENTOS.ETIQUETAS_CAMBIADAS, { tipo: 'eliminada', id });
        return { ok: true };
    },
};
