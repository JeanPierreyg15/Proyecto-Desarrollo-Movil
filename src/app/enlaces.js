// Acciones sobre enlaces: abrir en navegador nativo, copiar y compartir.
// En web usa window.open; en móvil abre Chrome Custom Tabs / SFSafariViewController
// mediante @capacitor/browser.

import { Browser } from '@capacitor/browser';
import { Clipboard } from '@capacitor/clipboard';
import { Share } from '@capacitor/share';

export function esNativo() {
    try {
        return Boolean(window.Capacitor?.isNativePlatform?.());
    } catch {
        return false;
    }
}

/** Abre una URL. Devuelve true si se pudo lanzar la apertura. */
export async function abrirEnlace(url) {
    if (!url) {
        return false;
    }
    if (esNativo()) {
        try {
            await Browser.open({ url });
            return true;
        } catch {
            // Si el plugin falla, se intenta el fallback web.
        }
    }
    // No se pasa "noopener" como característica: algunos navegadores devuelven
    // null aunque la pestaña sí se abra. Se corta la referencia manualmente.
    const ventana = window.open(url, '_blank');
    if (!ventana) {
        return false;
    }
    try {
        ventana.opener = null;
    } catch {
        /* la ventana ya se abrió; no importa si el navegador no permite tocarla */
    }
    return true;
}

/** Copia una URL al portapapeles. */
export async function copiarEnlace(url) {
    if (!url) {
        return false;
    }
    if (esNativo()) {
        try {
            await Clipboard.write({ string: url });
            return true;
        } catch {
            // Si el plugin nativo falla, se intenta la API del navegador.
        }
    }
    try {
        await navigator.clipboard.writeText(url);
        return true;
    } catch {
        return false;
    }
}

function compartirCancelado(error) {
    const mensaje = String(error?.message ?? '').toLowerCase();
    return error?.name === 'AbortError' || mensaje.includes('cancel');
}

/**
 * Comparte la URL con el selector del sistema si existe; si no, la copia.
 * Devuelve { ok, copiado, cancelado }.
 */
export async function compartirEnlace(url, titulo) {
    if (!url) {
        return { ok: false, copiado: false, cancelado: false };
    }

    if (esNativo()) {
        try {
            await Share.share({
                title: titulo || url,
                // Android concatena text + url, así que la URL solo va en `url`
                // para que el destino no la muestre dos veces.
                text: titulo || undefined,
                url,
                dialogTitle: 'Compartir enlace',
            });
            return { ok: true, copiado: false, cancelado: false };
        } catch (error) {
            if (compartirCancelado(error)) {
                return { ok: false, copiado: false, cancelado: true };
            }
            // Un fallo del plugin no debe impedir compartir: se sigue con la web.
        }
    }

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
            await navigator.share({ title: titulo || url, url });
            return { ok: true, copiado: false, cancelado: false };
        } catch (error) {
            if (compartirCancelado(error)) {
                return { ok: false, copiado: false, cancelado: true };
            }
        }
    }
    const copiado = await copiarEnlace(url);
    return { ok: copiado, copiado, cancelado: false };
}
