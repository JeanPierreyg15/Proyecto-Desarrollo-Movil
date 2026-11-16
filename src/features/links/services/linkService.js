// Servicio de links: se comunica con la API real (Backend-MovilLocker).
//   GET    /links/         -> listar los links del usuario autenticado
//   GET    /links/preview  -> título, descripción e imagen de una URL (web scraping)
//   POST   /links/         -> crear link { url, titulo, tag_ids }
//   PUT    /links/{id}     -> editar link { url, titulo, tag_ids }
//   DELETE /links/{id}     -> eliminar un link propio
//
// Cada cambio emite EVENTOS.LINKS_CAMBIADOS (los contadores de Etiquetas y
// Perfil dependen de los links).

import { apiRequest } from '../../../app/apiClient.js';
import { EVENTOS, emitir } from '../../../app/eventos.js';
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
    async listar({ skip = 0, limit = 100 } = {}) {
        const parametros = new URLSearchParams({ skip: String(skip), limit: String(limit) });
        const resultado = await apiRequest(`/links/?${parametros}`);
        if (!resultado.ok) {
            return resultado;
        }
        return { ok: true, datos: (resultado.datos ?? []).map(mapearLink) };
    },

    /** Total de links del usuario, sin el límite de la paginación. */
    async contar() {
        const resultado = await apiRequest('/links/count');
        if (!resultado.ok) {
            return resultado;
        }
        return { ok: true, datos: resultado.datos?.count ?? 0 };
    },

    /**
     * Vista previa de una URL (el backend descarga la página y lee su título,
     * descripción e imagen). Devuelve { ok, datos: { titulo, descripcion, imagen, sitio } }.
     */
    async previsualizar(url) {
        const urlNormalizada = normalizarUrl(url);
        if (!urlNormalizada) {
            return { ok: false, mensaje: 'URL no válida' };
        }
        const parametros = new URLSearchParams({ url: urlNormalizada });
        const resultado = await apiRequest(`/links/preview?${parametros}`);
        if (!resultado.ok) {
            return resultado;
        }
        const datos = resultado.datos ?? {};
        return {
            ok: true,
            datos: {
                url: datos.url ?? urlNormalizada,
                titulo: datos.titulo ?? null,
                descripcion: datos.descripcion ?? null,
                imagen: datos.imagen ?? null,
                sitio: datos.sitio ?? null,
            },
        };
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
        emitir(EVENTOS.LINKS_CAMBIADOS, { tipo: 'creado' });
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
        emitir(EVENTOS.LINKS_CAMBIADOS, { tipo: 'actualizado' });
        return { ok: true, datos: mapearLink(resultado.datos) };
    },

    async eliminar(id) {
        const resultado = await apiRequest(`/links/${id}`, { metodo: 'DELETE' });
        if (!resultado.ok) {
            return resultado;
        }
        emitir(EVENTOS.LINKS_CAMBIADOS, { tipo: 'eliminado' });
        return { ok: true };
    },
};
