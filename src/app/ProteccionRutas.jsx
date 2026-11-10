import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext.jsx';

/**
 * Protege rutas privadas: si no hay sesión redirige al login,
 * y mientras se comprueba el token guardado muestra una pantalla de carga.
 * Las rutas de autenticación usan RutaPublica para no volver a mostrarse con sesión activa.
 */
export function RutaProtegida({ children }) {
    const { usuario, cargandoSesion } = useAuth();

    if (cargandoSesion) {
        return (
            <IonPage>
                <IonContent className="ion-justify-content-center ion-align-items-center">
                    <IonSpinner name="crescent" aria-label="Cargando" />
                </IonContent>
            </IonPage>
        );
    }

    if (!usuario) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export function RutaPublica({ children }) {
    const { usuario, cargandoSesion } = useAuth();

    if (cargandoSesion) {
        return (
            <IonPage>
                <IonContent className="ion-justify-content-center ion-align-items-center">
                    <IonSpinner name="crescent" aria-label="Cargando" />
                </IonContent>
            </IonPage>
        );
    }

    if (usuario) {
        return <Navigate to="/pages/Home" replace />;
    }

    return children;
}
