// Servicio de etiquetas: se comunica con la API real (Backend-MovilLocker).
//   GET  /tags/  -> listar etiquetas del usuario autenticado
//   POST /tags/  -> crear etiqueta { nombre }

import { apiRequest } from '../../../app/apiClient.js';

/** Convierte una etiqueta de la API al formato que usan las vistas. */
function mapearEtiqueta(tagApi) {
    return {
        id: tagApi.id,
        titulo: tagApi.nombre,
        nombre: tagApi.nombre,
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

    async crear(nombre) {
        const resultado = await apiRequest('/tags/', {
            metodo: 'POST',
            datos: { nombre },
        });
        if (!resultado.ok) {
            return resultado;
        }
        return { ok: true, datos: mapearEtiqueta(resultado.datos) };
    },
};
