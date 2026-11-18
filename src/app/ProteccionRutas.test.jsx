import React, { useEffect, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@ionic/react', async () => {
    const { useNavigate: useNavigateReal } = await import('react-router-dom');
    return {
        IonPage: ({ children }) => <div>{children}</div>,
        IonContent: ({ children }) => <div>{children}</div>,
        IonSpinner: () => <div>Cargando</div>,
        // Las redirecciones usan el router de Ionic; en las pruebas navegamos
        // con React Router.
        useIonRouter: () => {
            const navigate = useNavigateReal();
            return { push: (ruta) => navigate(ruta, { replace: true }) };
        },
    };
});

const { sesion } = vi.hoisted(() => ({ sesion: { usuario: null } }));

vi.mock('../features/auth/context/AuthContext.jsx', () => ({
    useAuth: () => ({ usuario: sesion.usuario, cargandoSesion: false }),
}));

import { RutaComodin, RutaPublica } from './ProteccionRutas.jsx';

afterEach(() => {
    cleanup();
    sesion.usuario = null;
});

describe('RutaComodin', () => {
    it('redirige una URL desconocida al inicio', async () => {
        render(
            <MemoryRouter initialEntries={['/ruta-que-no-existe']}>
                <Routes>
                    <Route path="*" element={<RutaComodin />} />
                    <Route path="/" element={<div>Inicio</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText('Inicio')).toBeTruthy();
    });
});

describe('RutaPublica con la sesión ya iniciada', () => {
    /**
     * Simula la pila de Ionic: la página del login queda montada (oculta) y se
     * vuelve a renderizar con cada navegación.
     */
    function PilaConLoginMontado({ children }) {
        const location = useLocation();
        const [, refrescar] = useState(0);

        useEffect(() => {
            refrescar((valor) => valor + 1);
        }, [location.pathname]);

        return (
            <>
                {children}
                <Link to="/pages/Etiquetas">ir-etiquetas</Link>
                <Routes>
                    <Route path="/" element={<div>pagina-login</div>} />
                    <Route path="/pages/Home" element={<div>pagina-inicio</div>} />
                    <Route path="/pages/Etiquetas" element={<div>pagina-etiquetas</div>} />
                </Routes>
            </>
        );
    }

    it('redirige a Inicio una sola vez y deja navegar al resto de vistas', async () => {
        sesion.usuario = { id: 1, nombre: 'Ana', correo: 'ana@ejemplo.com' };

        render(
            <MemoryRouter initialEntries={['/']}>
                <PilaConLoginMontado>
                    <RutaPublica>
                        <div>contenido-login</div>
                    </RutaPublica>
                </PilaConLoginMontado>
            </MemoryRouter>
        );

        expect(await screen.findByText('pagina-inicio')).toBeTruthy();

        fireEvent.click(screen.getByText('ir-etiquetas'));

        expect(await screen.findByText('pagina-etiquetas')).toBeTruthy();
        expect(screen.queryByText('pagina-inicio')).toBeNull();
    });
});
