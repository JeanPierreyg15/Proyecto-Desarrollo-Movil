import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { estado, listarMock, contarMock } = vi.hoisted(() => ({
    estado: { entrar: null },
    listarMock: vi.fn(),
    contarMock: vi.fn(),
}));

vi.mock('@ionic/react', () => {
    const Passthrough = ({ children }) => <div>{children}</div>;
    return {
        IonPage: Passthrough,
        IonHeader: Passthrough,
        IonToolbar: Passthrough,
        IonContent: Passthrough,
        IonGrid: Passthrough,
        IonRow: Passthrough,
        IonCol: Passthrough,
        IonInput: () => null,
        IonModal: () => null,
        IonIcon: () => null,
        IonButton: ({ children, ...props }) => <button {...props}>{children}</button>,
        useIonRouter: () => ({ push: vi.fn() }),
        useIonToast: () => [vi.fn()],
        useIonAlert: () => [vi.fn()],
        useIonActionSheet: () => [vi.fn()],
        useIonViewWillEnter: (callback) => {
            estado.entrar = callback;
        },
    };
});

vi.mock('../services/tagService.js', () => ({
    tagService: {
        listar: (...args) => listarMock(...args),
        contar: (...args) => contarMock(...args),
    },
}));

vi.mock('../components/TagCard.jsx', () => ({
    default: ({ titulo }) => <div>{titulo}</div>,
}));

import TagsPage from './TagsPage.jsx';

function etiqueta(id) {
    return { id, nombre: `Etiqueta ${id}`, titulo: `Etiqueta ${id}`, icono: '🏷️', cantidad: 0 };
}

describe('TagsPage', () => {
    afterEach(cleanup);

    beforeEach(() => {
        estado.entrar = null;
        listarMock.mockReset();
        contarMock.mockReset().mockResolvedValue({ ok: true, datos: 0 });
    });

    it('muestra el error con botón Reintentar y recupera al pulsarlo', async () => {
        listarMock
            .mockResolvedValueOnce({ ok: false, mensaje: 'No hay conexión con el servidor.' })
            .mockResolvedValueOnce({ ok: true, datos: [etiqueta(1)] });

        render(<TagsPage />);
        act(() => estado.entrar());

        await waitFor(() =>
            expect(screen.getByText('No pudimos cargar tus etiquetas')).toBeInTheDocument()
        );
        expect(screen.getByText('No hay conexión con el servidor.')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Reintentar/ }));

        await waitFor(() => expect(screen.getByText('Etiqueta 1')).toBeInTheDocument());
        expect(screen.queryByText('No pudimos cargar tus etiquetas')).not.toBeInTheDocument();
    });

    it('carga la siguiente página de etiquetas en vez de pedir solo 200', async () => {
        const primera = Array.from({ length: 200 }, (_, i) => etiqueta(i + 1));
        const siguiente = [etiqueta(201), etiqueta(202)];

        listarMock
            .mockResolvedValueOnce({ ok: true, datos: primera })
            .mockResolvedValueOnce({ ok: true, datos: siguiente });

        render(<TagsPage />);
        act(() => estado.entrar());
        await waitFor(() => expect(screen.getByText('Etiqueta 1')).toBeInTheDocument());

        expect(listarMock).toHaveBeenNthCalledWith(1, { limit: 200 });

        fireEvent.click(screen.getByRole('button', { name: 'Cargar más etiquetas' }));

        await waitFor(() => expect(screen.getByText('Etiqueta 201')).toBeInTheDocument());
        expect(listarMock).toHaveBeenNthCalledWith(2, { skip: 200, limit: 200 });
        expect(screen.queryByRole('button', { name: 'Cargar más etiquetas' })).not.toBeInTheDocument();
    });
});
