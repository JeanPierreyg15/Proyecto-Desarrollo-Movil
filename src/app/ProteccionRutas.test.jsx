import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@ionic/react', () => ({
    IonPage: ({ children }) => <div>{children}</div>,
    IonContent: ({ children }) => <div>{children}</div>,
    IonSpinner: () => <div>Cargando</div>,
}));

vi.mock('../features/auth/context/AuthContext.jsx', () => ({
    useAuth: () => ({ usuario: null, cargandoSesion: false }),
}));

import { RutaComodin } from './ProteccionRutas.jsx';

describe('RutaComodin', () => {
    afterEach(cleanup);

    it('redirige una URL desconocida al inicio', () => {
        render(
            <MemoryRouter initialEntries={['/ruta-que-no-existe']}>
                <Routes>
                    <Route path="*" element={<RutaComodin />} />
                    <Route path="/" element={<div>Inicio</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Inicio')).toBeTruthy();
    });
});
