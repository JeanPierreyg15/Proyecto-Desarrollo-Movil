import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { clipboardWriteMock, shareMock } = vi.hoisted(() => ({
    clipboardWriteMock: vi.fn(),
    shareMock: vi.fn(),
}));

vi.mock('@capacitor/clipboard', () => ({
    Clipboard: { write: (...args) => clipboardWriteMock(...args) },
}));

vi.mock('@capacitor/share', () => ({
    Share: { share: (...args) => shareMock(...args) },
}));

import { abrirEnlace, compartirEnlace, copiarEnlace } from './enlaces.js';

describe('abrirEnlace en web', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('considera éxito cuando la pestaña se abre aunque el navegador devuelva null con noopener', async () => {
        // Chrome puede devolver null al pasar "noopener" como característica;
        // eso no significa que la apertura haya fallado.
        const abrir = vi.fn((_url, _destino, caracteristicas) =>
            caracteristicas?.includes('noopener') ? null : { opener: {} }
        );
        vi.stubGlobal('open', abrir);

        await expect(abrirEnlace('https://ejemplo.com')).resolves.toBe(true);
        expect(abrir).toHaveBeenCalledWith('https://ejemplo.com', '_blank');
    });

    it('solo devuelve false si el navegador bloqueó la apertura', async () => {
        vi.stubGlobal('open', vi.fn(() => null));
        await expect(abrirEnlace('https://ejemplo.com')).resolves.toBe(false);
    });
});

describe('portapapeles y compartir en móvil', () => {
    beforeEach(() => {
        clipboardWriteMock.mockReset();
        shareMock.mockReset();
        vi.stubGlobal('Capacitor', { isNativePlatform: () => true });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('copia con el plugin nativo en lugar de navigator.clipboard', async () => {
        clipboardWriteMock.mockResolvedValue(undefined);

        await expect(copiarEnlace('https://ejemplo.com')).resolves.toBe(true);
        expect(clipboardWriteMock).toHaveBeenCalledWith({ string: 'https://ejemplo.com' });
    });

    it('comparte con el selector nativo', async () => {
        shareMock.mockResolvedValue(undefined);

        const resultado = await compartirEnlace('https://ejemplo.com', 'Ejemplo');

        expect(resultado).toEqual({ ok: true, copiado: false, cancelado: false });
        expect(shareMock).toHaveBeenCalledWith(
            expect.objectContaining({ url: 'https://ejemplo.com', dialogTitle: 'Compartir enlace' })
        );
    });

    it('distingue la cancelación del usuario', async () => {
        shareMock.mockRejectedValue(new Error('Share canceled'));

        const resultado = await compartirEnlace('https://ejemplo.com', 'Ejemplo');

        expect(resultado.cancelado).toBe(true);
        expect(resultado.ok).toBe(false);
        expect(clipboardWriteMock).not.toHaveBeenCalled();
    });

    it('si el plugin de compartir falla, copia el enlace', async () => {
        shareMock.mockRejectedValue(new Error('no disponible'));
        clipboardWriteMock.mockResolvedValue(undefined);

        const resultado = await compartirEnlace('https://ejemplo.com', 'Ejemplo');

        expect(resultado).toEqual({ ok: true, copiado: true, cancelado: false });
        expect(clipboardWriteMock).toHaveBeenCalledWith({ string: 'https://ejemplo.com' });
    });
});
