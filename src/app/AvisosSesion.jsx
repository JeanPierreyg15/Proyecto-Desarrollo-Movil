import React from 'react';
import { IonButton, IonIcon, IonToast } from '@ionic/react';
import { cloudOfflineOutline } from 'ionicons/icons';
import { useAuth } from '../features/auth/context/AuthContext.jsx';

/**
 * Avisos globales de sesión:
 * - franja "Sin conexión" con reintento manual (además del reintento al volver la red);
 * - toast cuando un 401 cierra la sesión, para no redirigir en silencio.
 */
const AvisosSesion = () => {
    const {
        sinConexion,
        reintentarConexion,
        mensajeSesion,
        limpiarMensajeSesion,
    } = useAuth();

    return (
        <>
            {sinConexion && (
                <div className="aviso-sin-conexion" role="status" aria-live="polite">
                    <IonIcon icon={cloudOfflineOutline} aria-hidden="true" />
                    <span>Sin conexión</span>
                    <IonButton size="small" fill="clear" onClick={() => reintentarConexion()}>
                        Reintentar
                    </IonButton>
                </div>
            )}
            <IonToast
                isOpen={Boolean(mensajeSesion)}
                message={mensajeSesion ?? ''}
                duration={3000}
                color="danger"
                position="bottom"
                onDidDismiss={limpiarMensajeSesion}
            />
        </>
    );
};

export default AvisosSesion;
