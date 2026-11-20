import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const actualizar = vi.fn();
const previsualizar = vi.fn();

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
        previsualizar: (...args) => previsualizar(...args),
        crear: vi.fn(),
    },
}));

import LinkFormModal from './LinkFormModal.jsx';

describe('LinkFormModal', () => {
    afterEach(cleanup);

    beforeEach(() => {
        actualizar.mockReset();
        actualizar.mockResolvedValue({ ok: true, datos: {} });
        previsualizar.mockReset();
        previsualizar.mockResolvedValue({ ok: false, mensaje: 'sin red' });
    });

    it('autocompleta el título con la vista previa al escribir una URL', async () => {
        previsualizar.mockResolvedValue({
            ok: true,
            datos: { titulo: 'GitHub', descripcion: 'Donde vive el código', imagen: null, sitio: 'GitHub' },
        });
        render(<LinkFormModal isOpen cerrarModal={vi.fn()} etiquetas={[]} onGuardado={vi.fn()} />);

        fireEvent.change(screen.getByLabelText('https://...'), { target: { value: 'github.com' } });

        await waitFor(() => expect(screen.getByLabelText('Ej: Mi portafolio')).toHaveValue('GitHub'));
        expect(previsualizar).toHaveBeenCalledWith('https://github.com');
        expect(screen.getByText('Donde vive el código')).toBeInTheDocument();
    });

    it('no pisa un título que la persona ya escribió', async () => {
        previsualizar.mockResolvedValue({ ok: true, datos: { titulo: 'Sugerido' } });
        render(<LinkFormModal isOpen cerrarModal={vi.fn()} etiquetas={[]} onGuardado={vi.fn()} />);

        fireEvent.change(screen.getByLabelText('Ej: Mi portafolio'), { target: { value: 'Mi título' } });
        fireEvent.change(screen.getByLabelText('https://...'), { target: { value: 'ejemplo.com' } });

        await waitFor(() => expect(previsualizar).toHaveBeenCalled());
        expect(screen.getByLabelText('Ej: Mi portafolio')).toHaveValue('Mi título');
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
            imagen: null,
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
            imagen: null,
        });
    });

    it('si la imagen de la vista previa falla, prueba la siguiente sin dejar el hueco', async () => {
        previsualizar.mockResolvedValue({
            ok: true,
            datos: {
                url: 'https://youtu.be/dQw4w9WgXcQ',
                titulo: 'Video',
                descripcion: null,
                miniatura: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                sitio: 'YouTube',
            },
        });
        const { container } = render(
            <LinkFormModal isOpen cerrarModal={vi.fn()} etiquetas={[]} onGuardado={vi.fn()} />
        );

        fireEvent.change(screen.getByLabelText('https://...'), {
            target: { value: 'youtu.be/dQw4w9WgXcQ' },
        });

        await waitFor(() =>
            expect(container.querySelector('img')).toHaveAttribute(
                'src',
                'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
            )
        );

        // maxresdefault no existe en todos los videos: se cae a hqdefault.
        fireEvent.error(container.querySelector('img'));

        await waitFor(() =>
            expect(container.querySelector('img')).toHaveAttribute(
                'src',
                'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
            )
        );
    });

    it('no autocompleta un título genérico si la página no dio información', async () => {
        previsualizar.mockResolvedValue({
            ok: true,
            datos: { url: 'https://m.youtube.com/watch?v=corto', titulo: null, descripcion: null, sitio: 'YouTube' },
        });
        render(<LinkFormModal isOpen cerrarModal={vi.fn()} etiquetas={[]} onGuardado={vi.fn()} />);

        fireEvent.change(screen.getByLabelText('https://...'), {
            target: { value: 'm.youtube.com/watch?v=corto' },
        });

        await waitFor(() =>
            expect(screen.getByText(/No se pudo obtener información de este enlace/)).toBeInTheDocument()
        );
        expect(screen.getByLabelText('Ej: Mi portafolio')).toHaveValue('');
    });

    it('avisa cuando la consulta al servidor falla', async () => {
        render(<LinkFormModal isOpen cerrarModal={vi.fn()} etiquetas={[]} onGuardado={vi.fn()} />);

        fireEvent.change(screen.getByLabelText('https://...'), {
            target: { value: 'ejemplo.com' },
        });

        await waitFor(() =>
            expect(screen.getByText(/No se pudo consultar la página/)).toBeInTheDocument()
        );
    });

    it('guarda la miniatura de YouTube y en páginas normales no guarda imagen', async () => {
        render(
            <LinkFormModal
                isOpen
                cerrarModal={vi.fn()}
                etiquetas={[]}
                link={{ id: 9, url: 'https://youtu.be/dQw4w9WgXcQ', titulo: 'Video', tagIds: [] }}
                onGuardado={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

        await waitFor(() => expect(actualizar).toHaveBeenCalledTimes(1));
        expect(actualizar.mock.calls[0][1].imagen).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    });
});
