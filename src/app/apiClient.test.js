import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./almacenamiento.js', () => ({
    obtenerToken: vi.fn().mockResolvedValue(null),
    borrarToken: vi.fn().mockResolvedValue(undefined),
    borrarUsuario: vi.fn().mockResolvedValue(undefined),
}));

import { obtenerToken, borrarToken, borrarUsuario } from './almacenamiento.js';
import {
    apiRequest,
    configurarNoAutorizado,
    extraerMensaje,
    normalizarBaseUrl,
} from './apiClient.js';

describe('normalizarBaseUrl', () => {
    it('quita las barras finales para no generar URLs con doble barra', () => {
        expect(normalizarBaseUrl('http://localhost:8000/')).toBe('http://localhost:8000');
        expect(normalizarBaseUrl(' https://api.ejemplo.com/// ')).toBe('https://api.ejemplo.com');
    });

    it('usa localhost si no hay configuración', () => {
        expect(normalizarBaseUrl('')).toBe('http://localhost:8000');
        expect(normalizarBaseUrl(undefined)).toBe('http://localhost:8000');
    });
});

describe('extraerMensaje', () => {
    it('no duplica el nombre del campo cuando el backend ya redactó el mensaje', () => {
        const mensaje = extraerMensaje({
            detail: [
                {
                    loc: ['body', 'nombre'],
                    msg: 'El campo nombre es obligatorio.',
                    type: 'missing',
                },
            ],
        });

        expect(mensaje).toBe('El campo nombre es obligatorio.');
    });

    it('usa nombres de campo amigables y quita el prefijo técnico', () => {
        const mensaje = extraerMensaje({
            detail: [
                {
                    loc: ['body', 'email'],
                    msg: 'Value error, value is not a valid email address',
                    type: 'value_error',
                },
            ],
        });

        expect(mensaje).toBe('correo electrónico: value is not a valid email address');
    });

    it('une varios errores de validación', () => {
        const mensaje = extraerMensaje({
            detail: [
                { loc: ['body', 'email'], msg: 'El correo electrónico no es válido.', type: 'value_error' },
                { loc: ['body', 'password'], msg: 'La contraseña no puede superar 72 bytes.', type: 'value_error' },
            ],
        });

        expect(mensaje).toBe(
            'El correo electrónico no es válido. · La contraseña no puede superar 72 bytes.'
        );
    });
});

describe('apiRequest con errores de validación', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    beforeEach(() => {
        borrarToken.mockClear();
        borrarUsuario.mockClear();
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 422,
                json: async () => ({
                    detail: [
                        {
                            loc: ['body', 'email'],
                            msg: 'El correo electrónico no es válido.',
                            type: 'value_error',
                        },
                    ],
                }),
            })
        );
    });

    it('devuelve un mensaje legible en español', async () => {
        const resultado = await apiRequest('/auth/register', {
            metodo: 'POST',
            datos: { email: 'mal' },
            autenticado: false,
        });

        expect(resultado).toEqual({
            ok: false,
            mensaje: 'El correo electrónico no es válido.',
            estado: 422,
        });
    });
});

describe('apiRequest con 401', () => {
    afterEach(() => {
        configurarNoAutorizado(null);
        vi.unstubAllGlobals();
    });

    beforeEach(() => {
        borrarToken.mockClear();
        borrarUsuario.mockClear();
        obtenerToken.mockReset().mockResolvedValue('token-vigente');
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: async () => ({ detail: 'No se pudieron validar las credenciales' }),
            })
        );
    });

    it('limpia token, perfil cacheado y avisa a la app', async () => {
        const manejador = vi.fn();
        configurarNoAutorizado(manejador);

        const resultado = await apiRequest('/auth/me');

        expect(resultado.estado).toBe(401);
        expect(borrarToken).toHaveBeenCalledTimes(1);
        expect(borrarUsuario).toHaveBeenCalledTimes(1);
        expect(manejador).toHaveBeenCalledTimes(1);
    });

    it('no borra el token si un 401 tardío llega tras un login nuevo', async () => {
        // La petición usó un token, pero ya hay otro guardado: es una respuesta vieja.
        obtenerToken
            .mockResolvedValueOnce('token-antiguo')
            .mockResolvedValueOnce('token-nuevo');
        const manejador = vi.fn();
        configurarNoAutorizado(manejador);

        const resultado = await apiRequest('/auth/me');

        expect(resultado.estado).toBe(401);
        expect(borrarToken).not.toHaveBeenCalled();
        expect(borrarUsuario).not.toHaveBeenCalled();
        expect(manejador).not.toHaveBeenCalled();
    });

    it('no cierra la sesión en un login fallido (petición no autenticada)', async () => {
        const resultado = await apiRequest('/auth/login', {
            metodo: 'POST',
            datos: { email: 'ana@ejemplo.com', password: 'mala' },
            autenticado: false,
        });

        expect(resultado.estado).toBe(401);
        expect(borrarToken).not.toHaveBeenCalled();
        expect(borrarUsuario).not.toHaveBeenCalled();
    });
});
