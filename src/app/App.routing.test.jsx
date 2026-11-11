import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { navegacion } = vi.hoisted(() => ({ navegacion: { ruta: '/pages', usuario: { id: 1, nombre: 'Ana', correo: 'ana@ejemplo.com', iniciales: 'A' } } }));

vi.mock('@ionic/react', async () => {
    const React = await import('react');
    const { matchPath, useLocation } = await import('react-router-dom');
    const Passthrough = ({ children }) => <div>{children}</div>;
    // Emula el outlet de Ionic: elige la Route cuyo path casa con la URL.
    const IonRouterOutlet = ({ children }) => {
        const location = useLocation();
        const rutas = React.Children.toArray(children).filter((hijo) => hijo?.props?.path);
        const activa = rutas.find((ruta) =>
            matchPath(
                { path: ruta.props.path, end: !ruta.props.path.endsWith('*') },
                location.pathname
            )
        );
        return activa ? activa.props.element : null;
    };
    return {
        IonApp: Passthrough,
        IonRouterOutlet,
        IonTabs: Passthrough,
        IonTabBar: Passthrough,
        IonTabButton: ({ children }) => <div>{children}</div>,
        IonLabel: Passthrough,
        IonIcon: () => null,
        IonPage: Passthrough,
        IonContent: Passthrough,
        IonSpinner: () => null,
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

    it('redirige /pages a /pages/Home en lugar de dejar los tabs en blanco', () => {
        render(<App />);

        expect(screen.getByText('pagina-inicio')).toBeInTheDocument();
    });

    it('resuelve rutas absolutas dentro de /pages/*', () => {
        navegacion.ruta = '/pages/Etiquetas';
        render(<App />);

        expect(screen.getByText('pagina-etiquetas')).toBeInTheDocument();
    });

    it('mantiene las rutas públicas fuera de los tabs', () => {
        navegacion.ruta = '/registro';
        navegacion.usuario = null;
        render(<App />);

        expect(screen.getByText('pagina-registro')).toBeInTheDocument();
    });
});
