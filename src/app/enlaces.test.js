import { afterEach, describe, expect, it, vi } from 'vitest';
import { abrirEnlace } from './enlaces.js';

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
