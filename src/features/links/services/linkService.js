// Servicio de links: se comunica con la API real (Backend-MovilLocker).
//   GET    /links/      -> listar los links del usuario autenticado
//   POST   /links/      -> crear link { url, titulo, tag_ids }
//   DELETE /links/{id}  -> eliminar un link propio

import { apiRequest } from '../../../app/apiClient.js';

/** Convierte un link de la API al formato que usan las vistas. */
function mapearLink(linkApi) {
    return {
        id: linkApi.id,
        titulo: linkApi.titulo,
        url: linkApi.url,
        imagen: null, // la API aún no devuelve imagen de la página
        tiempo: null, // la API aún no devuelve fecha de creación
        etiquetas: (linkApi.tags ?? []).map((tag) => tag.nombre),
    };
}

export const linkService = {
    async listar() {
        const resultado = await apiRequest('/links/');
        if (!resultado.ok) {
            return resultado;
        }
        return { ok: true, datos: (resultado.datos ?? []).map(mapearLink) };
    },

    async crear({ titulo, url, tagIds = [] }) {
        const resultado = await apiRequest('/links/', {
            metodo: 'POST',
            datos: { url, titulo, tag_ids: tagIds },
        });
        if (!resultado.ok) {
            return resultado;
        }
        return { ok: true, datos: mapearLink(resultado.datos) };
    },

    async eliminar(id) {
        const resultado = await apiRequest(`/links/${id}`, { metodo: 'DELETE' });
        if (!resultado.ok) {
            return resultado;
        }
        return { ok: true };
    },
};
