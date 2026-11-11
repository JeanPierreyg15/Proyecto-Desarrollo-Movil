// Tema claro/oscuro. En móvil el valor se guarda en Preferences (almacenamiento
// nativo); en web se usa localStorage como respaldo.
import { Preferences } from '@capacitor/preferences';
import { StatusBar, Style } from '@capacitor/status-bar';

const CLAVE = 'locker-theme';

export function esNativo() {
    try {
        return Boolean(window.Capacitor?.isNativePlatform?.());
    } catch {
        return false;
    }
}

export function esOscuroInicial() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        if (guardado) {
            return guardado === 'dark';
        }
    } catch {
        // localStorage no disponible
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

async function leerTemaNativo() {
    try {
        const { value } = await Preferences.get({ key: CLAVE });
        return value === 'dark' ? true : value === 'light' ? false : null;
    } catch {
        return null;
    }
}

async function guardarTema(oscuro) {
    const valor = oscuro ? 'dark' : 'light';
    if (esNativo()) {
        try {
            await Preferences.set({ key: CLAVE, value: valor });
            return;
        } catch {
            // Si falla el almacenamiento nativo se intenta localStorage.
        }
    }
    try {
        localStorage.setItem(CLAVE, valor);
    } catch {
        // localStorage no disponible
    }
}

/** Ajusta la barra de estado al tema (texto claro sobre fondo oscuro y viceversa). */
function ajustarBarraEstado(oscuro) {
    if (!esNativo()) {
        return;
    }
    StatusBar.setStyle({ style: oscuro ? Style.Light : Style.Dark }).catch(() => {
        // El plugin puede no estar disponible en alguna plataforma.
    });
}

function aplicarClase(oscuro) {
    document.documentElement.classList.toggle('ion-palette-dark', oscuro);
    ajustarBarraEstado(oscuro);
}

export function aplicarTema(oscuro) {
    aplicarClase(oscuro);
    // El guardado puede tardar; no bloquea el cambio visual.
    void guardarTema(oscuro);
}

export async function initTema() {
    let oscuro = esOscuroInicial();
    if (esNativo()) {
        const nativo = await leerTemaNativo();
        if (nativo !== null) {
            oscuro = nativo;
        }
    }
    aplicarClase(oscuro);
}
