import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { addListenerMock, removeMock, minimizeAppMock } = vi.hoisted(() => ({
    addListenerMock: vi.fn(),
    removeMock: vi.fn(),
    minimizeAppMock: vi.fn(),
}));

vi.mock('@capacitor/app', () => ({
    App: {
        addListener: (...args) => addListenerMock(...args),
        minimizeApp: (...args) => minimizeAppMock(...args),
    },
}));

vi.mock('./enlaces.js', () => ({
    esNativo: () => true,
}));

import { useBotonAtras } from './botonAtras.js';

let escucha;

function Sonda() {
    useBotonAtras();
    return null;
}

function Pagina({ texto }) {
    return <div>{texto}</div>;
}

function renderizar(ruta) {
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <Sonda />
            <Routes>
                <Route path="/pages/Home" element={<Pagina texto="Inicio" />} />
                <Route path="/pages/Perfil" element={<Pagina texto="Perfil" />} />
                <Route path="/cambiar-contrasena" element={<Pagina texto="Cambiar" />} />
                <Route path="/" element={<Pagina texto="Login" />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('useBotonAtras en Android', () => {
    beforeEach(() => {
        escucha = null;
        addListenerMock.mockReset().mockImplementation((evento, callback) => {
            escucha = callback;
            return Promise.resolve({ remove: removeMock });
        });
        removeMock.mockReset();
        minimizeAppMock.mockReset();
    });

    afterEach(cleanup);

    it('minimiza la app cuando ya está en Inicio', async () => {
        renderizar('/pages/Home');
        await waitFor(() => expect(escucha).toBeTypeOf('function'));

        act(() => escucha({ canGoBack: true }));

        expect(minimizeAppMock).toHaveBeenCalledTimes(1);
    });

    it('vuelve a Inicio desde otra pestaña', async () => {
        renderizar('/pages/Perfil');
        await waitFor(() => expect(escucha).toBeTypeOf('function'));

        act(() => escucha({ canGoBack: true }));

        expect(screen.getByText('Inicio')).toBeInTheDocument();
    });

    it('vuelve al login fuera de las pestañas si no hay historial', async () => {
        renderizar('/cambiar-contrasena');
        await waitFor(() => expect(escucha).toBeTypeOf('function'));

        act(() => escucha({ canGoBack: false }));

        expect(screen.getByText('Login')).toBeInTheDocument();
    });
});
