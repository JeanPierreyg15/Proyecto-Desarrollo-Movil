// Bus de eventos mínimo para que las pestañas se enteren de los cambios.
//
// Las pestañas de Ionic se quedan montadas en memoria: si en Etiquetas se crea
// una etiqueta, Inicio no lo sabe hasta que vuelve a cargar sus datos. En vez de
// depender solo de useIonViewWillEnter (que no siempre se dispara al cambiar de
// pestaña), los servicios emiten un evento y cada página se actualiza sola.

export const EVENTOS = {
    ETIQUETAS_CAMBIADAS: 'locker:etiquetas-cambiadas',
    LINKS_CAMBIADOS: 'locker:links-cambiados',
};

const bus = typeof EventTarget !== 'undefined' ? new EventTarget() : null;

export function emitir(nombre, detalle = null) {
    bus?.dispatchEvent(new CustomEvent(nombre, { detail: detalle }));
}

/** Suscribe `manejador` al evento. Devuelve la función para desuscribirse. */
export function escuchar(nombre, manejador) {
    if (!bus) {
        return () => {};
    }
    const envoltorio = (evento) => manejador(evento.detail);
    bus.addEventListener(nombre, envoltorio);
    return () => bus.removeEventListener(nombre, envoltorio);
}
