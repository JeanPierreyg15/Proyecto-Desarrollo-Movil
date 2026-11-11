import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import LinkCard from './LinkCard.jsx';

describe('LinkCard accesibilidad', () => {
    afterEach(cleanup);

    it('separa el control principal del menú de acciones (sin botones anidados)', () => {
        const onAbrir = vi.fn();
        const onAcciones = vi.fn();

        render(
            <LinkCard
                titulo="Documentación"
                url="https://ejemplo.com/doc"
                imagen={null}
                tiempo="hoy"
                etiquetas={['Dev']}
                onAbrir={onAbrir}
                onAcciones={onAcciones}
            />
        );

        // El artículo ya no es interactivo: los dos botones son hermanos.
        expect(screen.queryByRole('link')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Abrir el enlace Documentación' }));
        expect(onAbrir).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: 'Acciones de Documentación' }));
        expect(onAcciones).toHaveBeenCalledTimes(1);
    });
});
