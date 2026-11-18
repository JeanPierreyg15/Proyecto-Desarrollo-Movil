import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { navegacion } = vi.hoisted(() => ({ navegacion: { ruta: '/pages', usuario: { id: 1, nombre: 'Ana', correo: 'ana@ejemplo.com', iniciales: 'A' } } }));

vi.mock('@ionic/react', async () => {
    const React = await import('react');
    const { Link, Routes, useNavigate } = await import('react-router-dom');
    const Passthrough = ({ children }) => <div>{children}</div>;
    const IonRouterOutlet = ({ children }) => <Routes>{children}</Routes>;
    return {
        IonApp: Passthrough,
        IonRouterOutlet,
        IonTabs: Passthrough,
        IonTabBar: Passthrough,
        IonTabButton: ({ children, href }) => <Link to={href}>{children}</Link>,
        IonLabel: Passthrough,
        IonIcon: () => null,
        IonPage: Passthrough,
        IonContent: Passthrough,
        IonSpinner: () => null,
        // Las redirecciones de ProteccionRutas usan el router de Ionic.
        useIonRouter: () => {
            const navigate = useNavigate();
            return { push: (ruta) => navigate(ruta, { replace: true }) };
        },
    };
});

vi.mock('@ionic/react-router', async () => {
    const { MemoryRouter } = await import('react-router-dom');
    return {
        IonReactRouter: ({ children }) => (
            <MemoryRouter initialEntries={[navegacion.ruta]}>{children}</MemoryRouter>
        ),
    };
});

vi.mock('../features/auth/context/AuthContext.jsx', () => ({
    AuthProvider: ({ children }) => <div>{children}</div>,
    useAuth: () => ({
        usuario: navegacion.usuario,
        cargandoSesion: false,
        sinConexion: false,
        mensajeSesion: null,
        limpiarMensajeSesion: vi.fn(),
        reintentarConexion: vi.fn(),
    }),
}));

vi.mock('./AvisosSesion.jsx', () => ({ default: () => null }));
vi.mock('./botonAtras.js', () => ({ useBotonAtras: () => {} }));

vi.mock('../features/auth/pages/LoginPage.jsx', () => ({
    default: () => <div>pagina-login</div>,
}));
vi.mock('../features/auth/pages/RegisterPage.jsx', () => ({
    default: () => <div>pagina-registro</div>,
}));
vi.mock('../features/auth/pages/PasswordRecoveryPage.jsx', () => ({
    default: () => <div>pagina-recuperar</div>,
}));
vi.mock('../features/profile/pages/ChangePasswordPage.jsx', () => ({
    default: () => <div>pagina-cambiar</div>,
}));
vi.mock('../features/links/pages/LinkListPage.jsx', () => ({
    default: () => <div>pagina-inicio</div>,
}));
vi.mock('../features/tags/pages/TagsPage.jsx', () => ({
    default: () => <div>pagina-etiquetas</div>,
}));
vi.mock('../features/profile/pages/ProfilePage.jsx', () => ({
    default: () => <div>pagina-perfil</div>,
}));

import App from './App.jsx';

describe('App rutas de /pages', () => {
    afterEach(cleanup);

    beforeEach(() => {
        navegacion.ruta = '/pages';
        navegacion.usuario = { id: 1, nombre: 'Ana', correo: 'ana@ejemplo.com', iniciales: 'A' };
    });

    it('redirige /pages a /pages/Home en lugar de dejar los tabs en blanco', async () => {
        render(<App />);

        expect(await screen.findByText('pagina-inicio')).toBeInTheDocument();
    });

    it('resuelve la ruta relativa de etiquetas dentro de /pages/*', () => {
        navegacion.ruta = '/pages/Etiquetas';
        render(<App />);

        expect(screen.getByText('pagina-etiquetas')).toBeInTheDocument();
    });

    it('resuelve la ruta relativa del perfil dentro de /pages/*', () => {
        navegacion.ruta = '/pages/Perfil';
        render(<App />);

        expect(screen.getByText('pagina-perfil')).toBeInTheDocument();
    });

    it('navega entre las pestañas de etiquetas y perfil', async () => {
        render(<App />);

        fireEvent.click(await screen.findByText('Etiquetas'));
        expect(await screen.findByText('pagina-etiquetas')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Perfil'));
        expect(await screen.findByText('pagina-perfil')).toBeInTheDocument();
    });

    it('redirige al login al abrir una pestaña sin sesión', async () => {
        navegacion.ruta = '/pages/Etiquetas';
        navegacion.usuario = null;
        render(<App />);

        expect(await screen.findByText('pagina-login')).toBeInTheDocument();
    });

    it('permite cambiar de pestaña al abrir / con la sesión ya iniciada', async () => {
        // Es lo que ocurre al reabrir la app: arranca en el login y la sesión
        // guardada redirige a Inicio. El login no debe seguir redirigiendo
        // después (Ionic lo mantiene montado en su pila).
        navegacion.ruta = '/';
        render(<App />);

        expect(await screen.findByText('pagina-inicio')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Etiquetas'));
        expect(await screen.findByText('pagina-etiquetas')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Perfil'));
        expect(await screen.findByText('pagina-perfil')).toBeInTheDocument();
    });

    it('mantiene las rutas públicas fuera de los tabs', () => {
        navegacion.ruta = '/registro';
        navegacion.usuario = null;
        render(<App />);

        expect(screen.getByText('pagina-registro')).toBeInTheDocument();
    });
});
