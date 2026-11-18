import React, { useEffect, useRef } from 'react';
import { IonContent, IonPage, IonSpinner, useIonRouter } from '@ionic/react';
import { useAuth } from '../features/auth/context/AuthContext.jsx';

/** Pantalla que se muestra mientras se comprueba la sesión o se redirige. */
function PantallaCargando() {
    return (
        <IonPage>
            <IonContent className="ion-justify-content-center ion-align-items-center">
                <IonSpinner name="crescent" aria-label="Cargando" />
            </IonContent>
        </IonPage>
    );
}

/**
 * Redirige una sola vez y con navegación de tipo "root".
 *
 * Ionic mantiene montadas las páginas anteriores de su pila (ocultas). Un
 * `<Navigate>` declarativo sigue vivo dentro de esas páginas y se ejecuta otra
 * vez en cada navegación, devolviendo siempre a la misma ruta. Ese era el
 * problema al reabrir la app con la sesión iniciada: el login seguía montado y
 * cada toque en una pestaña terminaba de vuelta en /pages/Home.
 *
 * Con "root" además se limpia la pila, así que la página que redirige se
 * desmonta y deja de intervenir en la navegación.
 */
export function Redireccion({ destino }) {
    const router = useIonRouter();
    const yaRedirigido = useRef(false);

    useEffect(() => {
        if (yaRedirigido.current) {
            return;
        }
        yaRedirigido.current = true;
        router.push(destino, 'root', 'replace');
    }, [destino, router]);

    return <PantallaCargando />;
}

/**
 * Protege rutas privadas: si no hay sesión redirige al login,
 * y mientras se comprueba el token guardado muestra una pantalla de carga.
 * Las rutas de autenticación usan RutaPublica para no volver a mostrarse con sesión activa.
 */
export function RutaProtegida({ children }) {
    const { usuario, cargandoSesion } = useAuth();

    if (cargandoSesion) {
        return <PantallaCargando />;
    }

    if (!usuario) {
        return <Redireccion destino="/" />;
    }

    return children;
}

export function RutaPublica({ children }) {
    const { usuario, cargandoSesion } = useAuth();

    if (cargandoSesion) {
        return <PantallaCargando />;
    }

    if (usuario) {
        return <Redireccion destino="/pages/Home" />;
    }

    return children;
}

/** Cualquier URL desconocida vuelve al inicio en vez de dejar la pantalla vacía. */
export function RutaComodin() {
    return <Redireccion destino="/" />;
}
