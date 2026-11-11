import { useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
    useIonToast,
    useIonRouter,
} from '@ionic/react';
import { lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { LONGITUD_MINIMA_PASSWORD, errorPassword as mensajeErrorPassword, passwordValida } from '../../../app/validaciones.js';
import './ChangePasswordPage.css';

function CambiarContrasena() {
    const [passwordActual, setPasswordActual] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [mostrarPasswordActual, setMostrarPasswordActual] = useState(false);
    const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [intentoEnviar, setIntentoEnviar] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [mostrarToast] = useIonToast();
    const router = useIonRouter();
    const { cambiarPassword } = useAuth();

    const errorActual = intentoEnviar && !passwordActual ? 'Ingresa tu contraseña actual.' : '';
    const errorNueva = intentoEnviar && !passwordValida(nuevaPassword)
        ? mensajeErrorPassword(nuevaPassword)
        : intentoEnviar && nuevaPassword === passwordActual
          ? 'La nueva contraseña debe ser diferente a la actual.'
          : '';
    const errorConfirmar = intentoEnviar
        ? !confirmarPassword
            ? 'Confirma tu nueva contraseña.'
            : nuevaPassword !== confirmarPassword
              ? 'Las contraseñas nuevas no coinciden.'
              : ''
        : '';

    const manejarCambiarPassword = async (e) => {
        e.preventDefault();
        setIntentoEnviar(true);
        if (
            !passwordActual ||
            !passwordValida(nuevaPassword) ||
            !confirmarPassword ||
            nuevaPassword !== confirmarPassword ||
            nuevaPassword === passwordActual
        ) {
            return;
        }

        setProcesando(true);
        const resultado = await cambiarPassword({ passwordActual, passwordNueva: nuevaPassword });
        setProcesando(false);

        if (!resultado.ok) {
            mostrarToast({
                message: resultado.mensaje,
                duration: 2500,
                color: 'danger',
                position: 'bottom',
            });
            return;
        }

        setPasswordActual('');
        setNuevaPassword('');
        setConfirmarPassword('');
        mostrarToast({
            message: 'Contraseña actualizada con éxito.',
            duration: 2000,
            color: 'success',
            position: 'bottom',
        });
        router.back();
    };

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/pages/Perfil" text="" />
                    </IonButtons>
                    <IonTitle>Cambiar contraseña</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding cambiar-content">
                <div className="cambiar-page">
                    <div className="cambiar-intro">
                        <div className="cambiar-icono">
                            <IonIcon icon={lockClosedOutline} aria-hidden="true" />
                        </div>
                        <p>Protege tu cuenta con una contraseña segura de al menos {LONGITUD_MINIMA_PASSWORD} caracteres.</p>
                    </div>

                    <form onSubmit={manejarCambiarPassword} className="cambiar-form" noValidate aria-busy={procesando}>
                        <div className="cambiar-campo">
                            <div className="cambiar-input-password">
                                <IonInput
                                    id="cambiar-actual"
                                    label="CONTRASEÑA ACTUAL"
                                    labelPlacement="stacked"
                                    value={passwordActual}
                                    onIonInput={(e) => setPasswordActual(e.detail.value ?? '')}
                                    className="cambiar-input"
                                    type={mostrarPasswordActual ? 'text' : 'password'}
                                    placeholder="Tu contraseña actual"
                                    fill="outline"
                                    autocomplete="current-password"
                                    aria-invalid={Boolean(errorActual)}
                                    aria-describedby={errorActual ? 'cambiar-actual-error' : undefined}
                                />
                                <button
                                    type="button"
                                    className="cambiar-ojo"
                                    aria-label={mostrarPasswordActual ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    onClick={() => setMostrarPasswordActual((v) => !v)}
                                >
                                    <IonIcon icon={mostrarPasswordActual ? eyeOffOutline : eyeOutline} />
                                </button>
                            </div>
                            {errorActual && <p className="auth-field-error" id="cambiar-actual-error" role="alert">{errorActual}</p>}
                        </div>
                        <div className="cambiar-campo">
                            <div className="cambiar-input-password">
                                <IonInput
                                    id="cambiar-nueva"
                                    label="NUEVA CONTRASEÑA"
                                    labelPlacement="stacked"
                                    value={nuevaPassword}
                                    onIonInput={(e) => setNuevaPassword(e.detail.value ?? '')}
                                    className="cambiar-input"
                                    type={mostrarNuevaPassword ? 'text' : 'password'}
                                    placeholder={`Mínimo ${LONGITUD_MINIMA_PASSWORD} caracteres`}
                                    fill="outline"
                                    autocomplete="new-password"
                                    aria-invalid={Boolean(errorNueva)}
                                    aria-describedby={errorNueva ? 'cambiar-nueva-error' : undefined}
                                />
                                <button
                                    type="button"
                                    className="cambiar-ojo"
                                    aria-label={mostrarNuevaPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    onClick={() => setMostrarNuevaPassword((v) => !v)}
                                >
                                    <IonIcon icon={mostrarNuevaPassword ? eyeOffOutline : eyeOutline} />
                                </button>
                            </div>
                            {errorNueva && <p className="auth-field-error" id="cambiar-nueva-error" role="alert">{errorNueva}</p>}
                        </div>
                        <div className="cambiar-campo">
                            <div className="cambiar-input-password">
                                <IonInput
                                    id="cambiar-confirmar"
                                    label="CONFIRMAR NUEVA CONTRASEÑA"
                                    labelPlacement="stacked"
                                    value={confirmarPassword}
                                    onIonInput={(e) => setConfirmarPassword(e.detail.value ?? '')}
                                    className="cambiar-input"
                                    type={mostrarConfirmar ? 'text' : 'password'}
                                    placeholder="Repite la nueva contraseña"
                                    fill="outline"
                                    autocomplete="new-password"
                                    aria-invalid={Boolean(errorConfirmar)}
                                    aria-describedby={errorConfirmar ? 'cambiar-confirmar-error' : undefined}
                                />
                                <button
                                    type="button"
                                    className="cambiar-ojo"
                                    aria-label={mostrarConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    onClick={() => setMostrarConfirmar((v) => !v)}
                                >
                                    <IonIcon icon={mostrarConfirmar ? eyeOffOutline : eyeOutline} />
                                </button>
                            </div>
                            {errorConfirmar && <p className="auth-field-error" id="cambiar-confirmar-error" role="alert">{errorConfirmar}</p>}
                        </div>

                        <IonButton className="cambiar-guardar" type="submit" expand="block" disabled={procesando}>
                            {procesando ? 'Actualizando...' : 'Cambiar contraseña'}
                        </IonButton>
                    </form>
                </div>
            </IonContent>
        </IonPage>
    );
}

export default CambiarContrasena;
