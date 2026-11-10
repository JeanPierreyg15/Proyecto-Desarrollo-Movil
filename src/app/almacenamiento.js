// Almacenamiento del token de sesión.
// En móvil usa Capacitor Preferences (SharedPreferences/UserDefaults) en lugar
// de localStorage; en web cae a localStorage.

import { Preferences } from '@capacitor/preferences';

const CLAVE_TOKEN = 'locker-token';

function esNativo() {
    try {
        return Boolean(window.Capacitor?.isNativePlatform?.());
    } catch {
        return false;
    }
}

export async function obtenerToken() {
    if (esNativo()) {
        const { value } = await Preferences.get({ key: CLAVE_TOKEN });
        return value ?? null;
    }
    try {
        return localStorage.getItem(CLAVE_TOKEN);
    } catch {
        return null;
    }
}

export async function guardarToken(token) {
    if (esNativo()) {
        await Preferences.set({ key: CLAVE_TOKEN, value: token });
        return;
    }
    try {
        localStorage.setItem(CLAVE_TOKEN, token);
    } catch {
        /* almacenamiento no disponible */
    }
}

export async function borrarToken() {
    if (esNativo()) {
        await Preferences.remove({ key: CLAVE_TOKEN });
        return;
    }
    try {
        localStorage.removeItem(CLAVE_TOKEN);
    } catch {
        /* almacenamiento no disponible */
    }
}
