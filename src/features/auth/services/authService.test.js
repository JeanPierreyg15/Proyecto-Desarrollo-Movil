import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    apiRequestMock,
    obtenerTokenMock,
    guardarTokenMock,
    borrarTokenMock,
    obtenerUsuarioMock,
    guardarUsuarioMock,
    borrarUsuarioMock,
} = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
    obtenerTokenMock: vi.fn(),
    guardarTokenMock: vi.fn(),
    borrarTokenMock: vi.fn(),
    obtenerUsuarioMock: vi.fn(),
    guardarUsuarioMock: vi.fn(),
    borrarUsuarioMock: vi.fn(),
}));

vi.mock('../../../app/apiClient.js', () => ({
    apiRequest: (...args) => apiRequestMock(...args),
}));

vi.mock('../../../app/almacenamiento.js', () => ({
    obtenerToken: (...args) => obtenerTokenMock(...args),
    guardarToken: (...args) => guardarTokenMock(...args),
    borrarToken: (...args) => borrarTokenMock(...args),
    obtenerUsuario: (...args) => obtenerUsuarioMock(...args),
    guardarUsuario: (...args) => guardarUsuarioMock(...args),
    borrarUsuario: (...args) => borrarUsuarioMock(...args),
}));

import { authService } from './authService.js';

const PERFIL_CACHEADO = {
    id: 1,
    nombre: 'Ana',
    correo: 'ana@ejemplo.com',
    avatarColor: '#2563eb',
    bio: '',
    iniciales: 'A',
};

describe('authService.restaurarSesion', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
        obtenerTokenMock.mockReset().mockResolvedValue('token-guardado');
        obtenerUsuarioMock.mockReset().mockResolvedValue(PERFIL_CACHEADO);
        guardarUsuarioMock.mockReset();
        borrarUsuarioMock.mockReset();
    });

    it('mantiene la sesión con el perfil cacheado cuando no hay red', async () => {
        apiRequestMock.mockResolvedValue({
            ok: false,
            mensaje: 'No hay conexión con el servidor.',
            estado: 0,
        });

        const { usuario, sinConexion } = await authService.restaurarSesion();

        expect(usuario).toEqual(PERFIL_CACHEADO);
        expect(sinConexion).toBe(true);
        expect(obtenerUsuarioMock).toHaveBeenCalledTimes(1);
    });

    it('cierra la sesión y borra el perfil cacheado ante un 401', async () => {
        apiRequestMock.mockResolvedValue({ ok: false, mensaje: 'No autorizado', estado: 401 });

        const { usuario, sinConexion } = await authService.restaurarSesion();

        expect(usuario).toBeNull();
        expect(sinConexion).toBe(false);
        expect(borrarUsuarioMock).toHaveBeenCalledTimes(1);
    });

    it('actualiza el perfil cacheado cuando /me responde bien', async () => {
        apiRequestMock.mockResolvedValue({
            ok: true,
            datos: {
                id: 1,
                nombre: 'Ana María',
                email: 'ana@ejemplo.com',
                avatar_color: '#7c3aed',
                bio: 'Hola',
            },
        });

        const { usuario, sinConexion } = await authService.restaurarSesion();

        expect(usuario.nombre).toBe('Ana María');
        expect(sinConexion).toBe(false);
        expect(guardarUsuarioMock).toHaveBeenCalledWith(usuario);
    });
});

describe('authService.iniciarSesion y cerrarSesion', () => {    beforeEach(() => {
        apiRequestMock.mockReset();
        guardarTokenMock.mockReset();
        guardarUsuarioMock.mockReset();
        borrarTokenMock.mockReset();
        borrarUsuarioMock.mockReset();
    });

    it('guarda token y perfil al iniciar sesión', async () => {
        apiRequestMock.mockResolvedValue({
            ok: true,
            datos: {
                access_token: 'token-nuevo',
                usuario: { id: 1, nombre: 'Ana', email: 'ana@ejemplo.com' },
            },
        });

        const resultado = await authService.iniciarSesion({
            correo: 'ana@ejemplo.com',
            password: 'secreto123',
        });

        expect(resultado.ok).toBe(true);
        expect(guardarTokenMock).toHaveBeenCalledWith('token-nuevo');
        expect(guardarUsuarioMock).toHaveBeenCalledWith(resultado.usuario);
    });

    it('borra token y perfil al cerrar sesión', async () => {
        await authService.cerrarSesion();

        expect(borrarTokenMock).toHaveBeenCalledTimes(1);
        expect(borrarUsuarioMock).toHaveBeenCalledTimes(1);
    });
});

describe('authService mensajes de contraseña', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
    });

    it('explica el límite de bytes al registrar', async () => {
        const resultado = await authService.registrar({
            nombre: 'Ana',
            correo: 'ana@ejemplo.com',
            password: 'ñ'.repeat(40),
        });

        expect(resultado.ok).toBe(false);
        expect(resultado.mensaje).toContain('72 bytes');
        expect(apiRequestMock).not.toHaveBeenCalled();
    });

    it('explica el límite de bytes al restablecer', async () => {
        const resultado = await authService.restablecerPassword({
            token: 'codigo',
            password: 'ñ'.repeat(40),
        });

        expect(resultado.ok).toBe(false);
        expect(resultado.mensaje).toContain('72 bytes');
        expect(apiRequestMock).not.toHaveBeenCalled();
    });
});
