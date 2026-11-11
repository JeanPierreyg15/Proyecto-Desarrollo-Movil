// Almacenamiento del token de sesión y de una copia del perfil.
// En móvil usa almacenamiento seguro (Keystore en Android / Keychain en iOS)
// mediante @aparajita/capacitor-secure-storage; en web cae a localStorage.
//
// Los valores antiguos guardados en Capacitor Preferences (texto plano) se
// migran al almacén seguro la primera vez que se leen.
//
// La copia del perfil permite seguir mostrando la sesión cuando la app arranca
// sin conexión: el token sigue siendo válido, solo no se puede consultar /me.

import { Preferences } from '@capacitor/preferences';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

const CLAVE_TOKEN = 'locker-token';
const CLAVE_USUARIO = 'locker-usuario';

function esNativo() {
    try {
        return Boolean(window.Capacitor?.isNativePlatform?.());
    } catch {
        return false;
    }
}

async function migrarDesdePreferences(clave) {
    try {
        const { value } = await Preferences.get({ key: clave });
        if (value === null || value === undefined) {
            return null;
        }
        await SecureStorage.set(clave, value);
        // El texto plano ya no hace falta y no debe quedarse en el dispositivo.
        await Preferences.remove({ key: clave });
        return value;
    } catch {
        return null;
    }
}

async function leerClave(clave) {
    if (esNativo()) {
        try {
            const valor = await SecureStorage.get(clave);
            if (valor !== null && valor !== undefined) {
                return String(valor);
            }
        } catch {
            // Si el plugin falla se intenta migrar/leer el almacén anterior.
        }
        return migrarDesdePreferences(clave);
    }
    try {
        return localStorage.getItem(clave);
    } catch {
        return null;
    }
}

async function guardarClave(clave, valor) {
    if (esNativo()) {
        await SecureStorage.set(clave, valor);
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
        try {
            await SecureStorage.remove(clave);
        } catch {
            /* la clave pudo no existir */
        }
        // Limpia también una copia antigua que no llegó a migrarse.
        try {
            await Preferences.remove({ key: clave });
        } catch {
            /* Preferences no disponible */
        }
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
