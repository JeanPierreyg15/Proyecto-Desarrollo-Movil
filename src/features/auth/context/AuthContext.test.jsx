import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { registrarMock, restaurarMock, configurarMock } = vi.hoisted(() => ({
    registrarMock: vi.fn(),
    restaurarMock: vi.fn(),
    configurarMock: vi.fn(),
}));

vi.mock('../../../app/apiClient.js', () => ({
    configurarNoAutorizado: (...args) => configurarMock(...args),
}));

vi.mock('../services/authService.js', () => ({
    authService: {
        restaurarSesion: (...args) => restaurarMock(...args),
        registrar: (...args) => registrarMock(...args),
    },
}));

import { AuthProvider, useAuth } from './AuthContext.jsx';

const USUARIO = {
    id: 1,
    nombre: 'Ana',
    correo: 'ana@ejemplo.com',
    iniciales: 'A',
};

function Consumidor() {
    const { usuario, cargandoSesion, registrar, sinConexion, mensajeSesion } = useAuth();
    return (
        <div>
            <span data-testid="usuario">{usuario ? usuario.correo : 'sin-sesion'}</span>
            <span data-testid="cargando">{cargandoSesion ? 'si' : 'no'}</span>
            <span data-testid="sin-conexion">{sinConexion ? 'si' : 'no'}</span>
            <span data-testid="mensaje">{mensajeSesion ?? ''}</span>
            <button
                type="button"
                onClick={() => registrar({ nombre: 'Ana', correo: 'ana@ejemplo.com', password: 'secreto123' })}
            >
                Registrar
            </button>
        </div>
    );
}

async function renderizarYEsperarSesion() {
    render(
        <AuthProvider>
            <Consumidor />
        </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('cargando').textContent).toBe('no'));
}

describe('AuthContext.registrar', () => {
    afterEach(cleanup);

    beforeEach(() => {
        registrarMock.mockReset();
        restaurarMock.mockReset();
        restaurarMock.mockResolvedValue({ usuario: null, sinConexion: false });
        configurarMock.mockReset();
    });

    it('no inicia sesión si el registro quedó con sesión pendiente', async () => {
        registrarMock.mockResolvedValue({ ok: true, usuario: USUARIO, sesionPendiente: true });
        await renderizarYEsperarSesion();

        await act(async () => {
            screen.getByRole('button', { name: 'Registrar' }).click();
        });

        expect(screen.getByTestId('usuario').textContent).toBe('sin-sesion');
    });

    it('inicia sesión cuando el registro y el login automático funcionan', async () => {
        registrarMock.mockResolvedValue({ ok: true, usuario: USUARIO });
        await renderizarYEsperarSesion();

        await act(async () => {
            screen.getByRole('button', { name: 'Registrar' }).click();
        });

        expect(screen.getByTestId('usuario').textContent).toBe('ana@ejemplo.com');
    });
});

describe('AuthContext avisos de sesión', () => {
    afterEach(cleanup);

    beforeEach(() => {
        registrarMock.mockReset();
        restaurarMock.mockReset();
        configurarMock.mockReset();
    });

    it('muestra el aviso de sin conexión al restaurar desde la copia local', async () => {
        restaurarMock.mockResolvedValue({ usuario: USUARIO, sinConexion: true });
        await renderizarYEsperarSesion();

        expect(screen.getByTestId('sin-conexion').textContent).toBe('si');
        expect(screen.getByTestId('usuario').textContent).toBe('ana@ejemplo.com');
    });

    it('avisa cuando un 401 cierra la sesión', async () => {
        restaurarMock.mockResolvedValue({ usuario: USUARIO, sinConexion: false });
        await renderizarYEsperarSesion();

        const manejador = configurarMock.mock.calls[0][0];
        await act(async () => {
            manejador();
        });

        expect(screen.getByTestId('usuario').textContent).toBe('sin-sesion');
        expect(screen.getByTestId('mensaje').textContent).toBe(
            'Tu sesión expiró, inicia sesión de nuevo'
        );
    });
});
