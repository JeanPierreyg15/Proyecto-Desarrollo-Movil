// Almacenamiento del token de sesión y de una copia del perfil.
// En móvil usa Capacitor Preferences (SharedPreferences/UserDefaults) en lugar
// de localStorage; en web cae a localStorage.
//
// La copia del perfil permite seguir mostrando la sesión cuando la app arranca
// sin conexión: el token sigue siendo válido, solo no se puede consultar /me.

import { Preferences } from '@capacitor/preferences';

const CLAVE_TOKEN = 'locker-token';
const CLAVE_USUARIO = 'locker-usuario';

function esNativo() {
    try {
        return Boolean(window.Capacitor?.isNativePlatform?.());
    } catch {
        return false;
    }
}

async function leerClave(clave) {
    if (esNativo()) {
        const { value } = await Preferences.get({ key: clave });
        return value ?? null;
    }
    try {
        return localStorage.getItem(clave);
    } catch {
        return null;
    }
}

async function guardarClave(clave, valor) {
    if (esNativo()) {
        await Preferences.set({ key: clave, value: valor });
        return;
    }
    try {
        localStorage.setItem(clave, valor);
    } catch {
        /* almacenamiento no disponible */
    }
}

async function borrarClave(clave) {
    if (esNativo()) {
        await Preferences.remove({ key: clave });
        return;
    }
    try {
        localStorage.removeItem(clave);
    } catch {
        /* almacenamiento no disponible */
    }
}

export async function obtenerToken() {
    return leerClave(CLAVE_TOKEN);
}

export async function guardarToken(token) {
    await guardarClave(CLAVE_TOKEN, token);
}

export async function borrarToken() {
    await borrarClave(CLAVE_TOKEN);
}

export async function obtenerUsuario() {
    const texto = await leerClave(CLAVE_USUARIO);
    if (!texto) {
        return null;
    }
    try {
        const usuario = JSON.parse(texto);
        return usuario && usuario.correo ? usuario : null;
    } catch {
        return null;
    }
}

export async function guardarUsuario(usuario) {
    if (!usuario) {
        await borrarUsuario();
        return;
    }
    await guardarClave(CLAVE_USUARIO, JSON.stringify(usuario));
}

export async function borrarUsuario() {
    await borrarClave(CLAVE_USUARIO);
}
