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
} from '@ionic/react';
import { lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import './ChangePasswordPage.css';

function CambiarContrasena() {
    const [passwordActual, setPasswordActual] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [mostrarPasswordActual, setMostrarPasswordActual] = useState(false);
    const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [mostrarToast] = useIonToast();

    const manejarCambiarPassword = (e) => {
        e.preventDefault();
        if (!passwordActual || !nuevaPassword || !confirmarPassword) {
            mostrarToast({ message: 'Completa todos los campos de contraseña.', duration: 2000, color: 'warning', position: 'bottom' });
            return;
        }
        if (nuevaPassword !== confirmarPassword) {
            mostrarToast({ message: 'Las contraseñas nuevas no coinciden.', duration: 2000, color: 'danger', position: 'bottom' });
            return;
        }
        if (nuevaPassword.length < 8) {
            mostrarToast({ message: 'La contraseña debe tener al menos 8 caracteres.', duration: 2000, color: 'warning', position: 'bottom' });
            return;
        }
        mostrarToast({ message: 'El cambio de contraseña estará disponible próximamente.', duration: 2500, color: 'medium', position: 'bottom' });
        setPasswordActual('');
        setNuevaPassword('');
        setConfirmarPassword('');
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
                        <p>Protege tu cuenta con una contraseña segura de al menos 8 caracteres.</p>
                    </div>

                    <form onSubmit={manejarCambiarPassword} className="cambiar-form">
                        <div className="cambiar-campo">
                            <label htmlFor="cambiar-actual">CONTRASEÑA ACTUAL</label>
                            <div className="cambiar-input-password">
                                <IonInput
                                    id="cambiar-actual"
                                    value={passwordActual}
                                    onIonInput={(e) => setPasswordActual(e.detail.value ?? '')}
                                    className="cambiar-input"
                                    type={mostrarPasswordActual ? 'text' : 'password'}
                                    placeholder="Tu contraseña actual"
                                    fill="outline"
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
                        </div>
                        <div className="cambiar-campo">
                            <label htmlFor="cambiar-nueva">NUEVA CONTRASEÑA</label>
                            <div className="cambiar-input-password">
                                <IonInput
                                    id="cambiar-nueva"
                                    value={nuevaPassword}
                                    onIonInput={(e) => setNuevaPassword(e.detail.value ?? '')}
                                    className="cambiar-input"
                                    type={mostrarNuevaPassword ? 'text' : 'password'}
                                    placeholder="Mínimo 8 caracteres"
                                    fill="outline"
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
                        </div>
                        <div className="cambiar-campo">
                            <label htmlFor="cambiar-confirmar">CONFIRMAR NUEVA CONTRASEÑA</label>
                            <div className="cambiar-input-password">
                                <IonInput
                                    id="cambiar-confirmar"
                                    value={confirmarPassword}
                                    onIonInput={(e) => setConfirmarPassword(e.detail.value ?? '')}
                                    className="cambiar-input"
                                    type={mostrarConfirmar ? 'text' : 'password'}
                                    placeholder="Repite la nueva contraseña"
                                    fill="outline"
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
                        </div>

                        <IonButton className="cambiar-guardar" type="submit" expand="block">
                            Cambiar contraseña
                        </IonButton>
                    </form>
                </div>
            </IonContent>
        </IonPage>
    );
}

export default CambiarContrasena;
