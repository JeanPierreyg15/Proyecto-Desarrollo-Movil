const CLAVE = 'locker-theme';

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

export function aplicarTema(oscuro) {
    document.documentElement.classList.toggle('ion-palette-dark', oscuro);
    try {
        localStorage.setItem(CLAVE, oscuro ? 'dark' : 'light');
    } catch {
        // localStorage no disponible
    }
}

export function initTema() {
    document.documentElement.classList.toggle('ion-palette-dark', esOscuroInicial());
}
