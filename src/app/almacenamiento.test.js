import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { secureGet, secureSet, secureRemove, prefGet, prefRemove } = vi.hoisted(() => ({
    secureGet: vi.fn(),
    secureSet: vi.fn(),
    secureRemove: vi.fn(),
    prefGet: vi.fn(),
    prefRemove: vi.fn(),
}));

vi.mock('@aparajita/capacitor-secure-storage', () => ({
    SecureStorage: {
        get: (...args) => secureGet(...args),
        set: (...args) => secureSet(...args),
        remove: (...args) => secureRemove(...args),
    },
}));

vi.mock('@capacitor/preferences', () => ({
    Preferences: {
        get: (...args) => prefGet(...args),
        remove: (...args) => prefRemove(...args),
    },
}));

import { borrarToken, guardarToken, obtenerToken } from './almacenamiento.js';

describe('almacenamiento seguro en nativo', () => {
    beforeEach(() => {
        secureGet.mockReset();
        secureSet.mockReset();
        secureRemove.mockReset();
        prefGet.mockReset();
        prefRemove.mockReset();
        vi.stubGlobal('Capacitor', { isNativePlatform: () => true });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('guarda el token en el almacén seguro, no en Preferences', async () => {
        await guardarToken('token-seguro');

        expect(secureSet).toHaveBeenCalledWith('locker-token', 'token-seguro');
    });

    it('migra un token antiguo de Preferences al almacén seguro', async () => {
        secureGet.mockResolvedValue(null);
        prefGet.mockResolvedValue({ value: 'token-antiguo' });

        await expect(obtenerToken()).resolves.toBe('token-antiguo');
        expect(secureSet).toHaveBeenCalledWith('locker-token', 'token-antiguo');
        expect(prefRemove).toHaveBeenCalledWith({ key: 'locker-token' });
    });

    it('borra también la copia antigua en Preferences', async () => {
        await borrarToken();

        expect(secureRemove).toHaveBeenCalledWith('locker-token');
        expect(prefRemove).toHaveBeenCalledWith({ key: 'locker-token' });
    });
});
