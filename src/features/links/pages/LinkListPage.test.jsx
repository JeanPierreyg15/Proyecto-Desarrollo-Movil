import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { estado, listarMock, contarMock, etiquetasMock, nuevoLink } = vi.hoisted(() => ({
    estado: { entrar: null },
    listarMock: vi.fn(),
    contarMock: vi.fn(),
    etiquetasMock: vi.fn(),
    nuevoLink: { id: 99, titulo: 'Nuevo guardado', url: 'https://nuevo.com', etiquetas: [], tagIds: [] },
}));

vi.mock('@ionic/react', () => {
    const Passthrough = ({ children }) => <div>{children}</div>;
    return {
        IonPage: Passthrough,
        IonHeader: Passthrough,
        IonToolbar: Passthrough,
        IonContent: Passthrough,
        IonRefresher: Passthrough,
        IonRefresherContent: () => null,
        IonFab: Passthrough,
        IonFabButton: ({ children, ...props }) => <button {...props}>{children}</button>,
        IonButton: ({ children, ...props }) => <button {...props}>{children}</button>,
        IonIcon: () => null,
        IonSearchbar: ({ value, onIonInput, ...props }) => (
            <input
                aria-label={props['aria-label']}
                value={value ?? ''}
                onChange={(evento) => onIonInput?.({ detail: { value: evento.target.value } })}
            />
        ),
        IonInfiniteScroll: ({ children, onIonInfinite }) => (
            <div>
                <button
                    type="button"
                    onClick={() => onIonInfinite?.({ target: { complete: vi.fn() } })}
                >
                    cargar-mas
                </button>
                {children}
            </div>
        ),
        IonInfiniteScrollContent: () => null,
        useIonRouter: () => ({ push: vi.fn() }),
        useIonToast: () => [vi.fn()],
        useIonAlert: () => [vi.fn()],
        useIonActionSheet: () => [vi.fn()],
        useIonViewWillEnter: (callback) => {
            estado.entrar = callback;
        },
    };
});

vi.mock('../services/linkService.js', () => ({
    linkService: {
        listar: (...args) => listarMock(...args),
        contar: (...args) => contarMock(...args),
        eliminar: vi.fn(),
    },
}));

vi.mock('../../tags/services/tagService.js', () => ({
    tagService: {
        listar: (...args) => etiquetasMock(...args),
    },
}));

vi.mock('../../../app/enlaces.js', () => ({
    abrirEnlace: vi.fn(),
    copiarEnlace: vi.fn(),
    compartirEnlace: vi.fn(),
}));

vi.mock('../components/LinkFormModal.jsx', () => ({
    default: ({ onGuardado }) => (
        <button type="button" onClick={() => onGuardado(nuevoLink)}>
            guardar-modal
        </button>
    ),
}));

vi.mock('../../auth/context/AuthContext.jsx', () => ({
    useAuth: () => ({ usuario: { nombre: 'Ana', iniciales: 'A', avatarColor: '#2563eb' } }),
}));

import Home from './LinkListPage.jsx';

const renderizar = () =>
    render(
        <MemoryRouter>
            <Home />
        </MemoryRouter>
    );

function crearLink(id, { titulo, tagIds = [] } = {}) {
    return {
        id,
        titulo: titulo ?? `Link ${id}`,
        url: `https://ejemplo.com/${id}`,
        dominio: 'ejemplo.com',
        imagen: null,
        tiempo: 'hoy',
        etiquetas: [],
        tagIds,
    };
}

function diferido() {
    let resolver;
    const promesa = new Promise((resolve) => {
        resolver = resolve;
    });
    return { promesa, resolver };
}

const ETIQUETAS = [
    { id: 1, nombre: 'Dev' },
    { id: 2, nombre: 'Ocio' },
];

describe('LinkListPage', () => {
    afterEach(cleanup);

    beforeEach(() => {
        estado.entrar = null;
        listarMock.mockReset();
        contarMock.mockReset().mockResolvedValue({ ok: true, datos: 60 });
        etiquetasMock.mockReset().mockResolvedValue({ ok: true, datos: ETIQUETAS });
    });

    it('refresca en segundo plano sin perder las páginas ya cargadas', async () => {
        const primera = Array.from({ length: 50 }, (_, i) => crearLink(i + 1));
        const segunda = Array.from({ length: 10 }, (_, i) => crearLink(i + 51));
        const refresco = Array.from({ length: 50 }, (_, i) =>
            crearLink(i + 1, { titulo: i === 0 ? 'Actualizado 1' : `Link ${i + 1}` })
        );

        listarMock
            .mockResolvedValueOnce({ ok: true, datos: primera })
            .mockResolvedValueOnce({ ok: true, datos: segunda })
            .mockResolvedValueOnce({ ok: true, datos: refresco });

        renderizar();
        act(() => estado.entrar());
        await waitFor(() => expect(screen.getByText('Link 1')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: 'cargar-mas' }));
        await waitFor(() => expect(screen.getByText('Link 60')).toBeInTheDocument());

        act(() => estado.entrar());
        // Sin skeleton: el refresco silencioso no vuelve al estado de carga.
        expect(document.querySelector('.link-skeleton')).toBeNull();

        await waitFor(() => expect(screen.getByText('Actualizado 1')).toBeInTheDocument());
        expect(screen.getByText('Link 60')).toBeInTheDocument();
    });

    it('descarta la respuesta de una carga que ya quedó obsoleta', async () => {
        const vieja = diferido();
        const nueva = diferido();
        listarMock
            .mockReturnValueOnce(vieja.promesa)
            .mockReturnValueOnce(nueva.promesa);

        renderizar();
        act(() => estado.entrar());
        act(() => estado.entrar());

        await act(async () => {
            nueva.resolver({ ok: true, datos: [crearLink(2, { titulo: 'Nuevo' })] });
        });
        await act(async () => {
            vieja.resolver({ ok: true, datos: [crearLink(1, { titulo: 'Viejo' })] });
        });

        expect(screen.getByText('Nuevo')).toBeInTheDocument();
        expect(screen.queryByText('Viejo')).not.toBeInTheDocument();
    });

    it('inserta el link guardado sin recargar la lista completa', async () => {
        listarMock.mockResolvedValue({ ok: true, datos: [crearLink(1)] });

        renderizar();
        act(() => estado.entrar());
        await waitFor(() => expect(screen.getByText('Link 1')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: 'guardar-modal' }));

        expect(screen.getByText('Nuevo guardado')).toBeInTheDocument();
        expect(listarMock).toHaveBeenCalledTimes(1);
        expect(contarMock).toHaveBeenCalledTimes(2);
    });

    it('limpia un filtro por id cuando la etiqueta deja de existir', async () => {
        listarMock.mockResolvedValue({
            ok: true,
            datos: [crearLink(1, { tagIds: [1] }), crearLink(2, { tagIds: [2] })],
        });

        renderizar();
        act(() => estado.entrar());
        await waitFor(() => expect(screen.getByText('Link 1')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: 'Dev' }));
        expect(screen.queryByText('Link 2')).not.toBeInTheDocument();

        etiquetasMock.mockResolvedValue({ ok: true, datos: [{ id: 2, nombre: 'Ocio' }] });
        await act(async () => estado.entrar());

        await waitFor(() =>
            expect(screen.queryByRole('button', { name: 'Dev' })).not.toBeInTheDocument()
        );
        expect(screen.getByText('Link 1')).toBeInTheDocument();
        expect(screen.getByText('Link 2')).toBeInTheDocument();
    });
});
