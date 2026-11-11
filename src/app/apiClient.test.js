import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./almacenamiento.js', () => ({
    obtenerToken: vi.fn().mockResolvedValue(null),
    borrarToken: vi.fn().mockResolvedValue(undefined),
}));

import { apiRequest, extraerMensaje } from './apiClient.js';

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
