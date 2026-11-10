// Servicio de links: se comunica con la API real (Backend-MovilLocker).
//   GET    /links/      -> listar los links del usuario autenticado
//   POST   /links/      -> crear link { url, titulo, tag_ids }
//   PUT    /links/{id}  -> editar link { url, titulo, tag_ids }
//   DELETE /links/{id}  -> eliminar un link propio

import { apiRequest } from '../../../app/apiClient.js';
import {
    dominioDeUrl,
    faviconDeUrl,
    normalizarUrl,
    tiempoRelativo,
} from '../../../app/validaciones.js';

/** Convierte un link de la API al formato que usan las vistas. */
function mapearLink(linkApi) {
    const url = linkApi.url ?? '';
    const tags = linkApi.tags ?? [];
    return {
        id: linkApi.id,
        titulo: linkApi.titulo ?? '',
        url,
        dominio: dominioDeUrl(url),
        imagen: faviconDeUrl(url),
        tiempo: tiempoRelativo(linkApi.created_at),
        creadoEn: linkApi.created_at ?? null,
        etiquetas: tags.map((tag) => tag.nombre),
        tagIds: tags.map((tag) => tag.id),
    };
}

function prepararDatos({ titulo, url, tagIds = [] }) {
    const urlNormalizada = normalizarUrl(url);
    if (!urlNormalizada) {
        return { ok: false, mensaje: 'Ingresa un enlace válido (http o https).' };
    }
    if (!titulo?.trim()) {
        return { ok: false, mensaje: 'Escribe un título para el enlace.' };
    }
    return {
        ok: true,
        datos: { url: urlNormalizada, titulo: titulo.trim(), tag_ids: tagIds },
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

    async crear(datosLink) {
        const preparado = prepararDatos(datosLink);
        if (!preparado.ok) {
            return preparado;
        }
        const resultado = await apiRequest('/links/', { metodo: 'POST', datos: preparado.datos });
        if (!resultado.ok) {
            return resultado;
        }
        return { ok: true, datos: mapearLink(resultado.datos) };
    },

    async actualizar(id, datosLink) {
        const preparado = prepararDatos(datosLink);
        if (!preparado.ok) {
            return preparado;
        }
        const resultado = await apiRequest(`/links/${id}`, { metodo: 'PUT', datos: preparado.datos });
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
