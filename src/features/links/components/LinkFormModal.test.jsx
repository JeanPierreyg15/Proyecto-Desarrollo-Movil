import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const actualizar = vi.fn();

vi.mock('@ionic/react', () => ({
    IonModal: ({ isOpen, children }) => (isOpen ? <div>{children}</div> : null),
    IonContent: ({ children }) => <div>{children}</div>,
    IonInput: ({ value, onIonInput, ...props }) => (
        <input
            aria-label={props.placeholder}
            value={value ?? ''}
            onChange={(evento) => onIonInput?.({ detail: { value: evento.target.value } })}
        />
    ),
    useIonToast: () => [vi.fn()],
}));

vi.mock('../services/linkService.js', () => ({
    linkService: {
        actualizar: (...args) => actualizar(...args),
        crear: vi.fn(),
    },
}));

import LinkFormModal from './LinkFormModal.jsx';

describe('LinkFormModal', () => {
    afterEach(cleanup);

    beforeEach(() => {
        actualizar.mockReset();
        actualizar.mockResolvedValue({ ok: true, datos: {} });
    });

    it('conserva los ids originales al editar si las etiquetas no cargaron', async () => {
        render(
            <LinkFormModal
                isOpen
                cerrarModal={vi.fn()}
                etiquetas={[]}
                link={{
                    id: 7,
                    url: 'https://a.com',
                    titulo: 'A',
                    etiquetas: ['Tres', 'Cuatro'],
                    tagIds: [3, 4],
                }}
                onGuardado={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

        await waitFor(() => expect(actualizar).toHaveBeenCalledTimes(1));
        expect(actualizar).toHaveBeenCalledWith(7, {
            url: 'https://a.com',
            titulo: 'A',
            tagIds: [3, 4],
        });
    });

    it('guarda etiquetas por id, sin convertirlas silenciosamente a vacío', async () => {
        render(
            <LinkFormModal
                isOpen
                cerrarModal={vi.fn()}
                etiquetas={[
                    { id: 3, nombre: 'Tres' },
                    { id: 4, nombre: 'Cuatro' },
                ]}
                link={{ id: 8, url: 'https://b.com', titulo: 'B', etiquetas: ['Tres'], tagIds: [3] }}
                onGuardado={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Cuatro' }));
        fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

        await waitFor(() => expect(actualizar).toHaveBeenCalledTimes(1));
        expect(actualizar).toHaveBeenCalledWith(8, {
            url: 'https://b.com',
            titulo: 'B',
            tagIds: [3, 4],
        });
    });
});
