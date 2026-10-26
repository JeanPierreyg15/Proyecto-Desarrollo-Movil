import { IonPage, IonContent, IonInput, IonButton, useIonToast, IonInputPasswordToggle, useIonRouter } from '@ionic/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../Login/media/logo.svg';
import '../Login/login.css';
import './recuperar.css';

function Recuperar() {
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [paso, setPaso] = useState('correo');
    const [mostrarToast] = useIonToast();
    const router = useIonRouter();
    const { solicitarRecuperacion, restablecerPassword } = useAuth();

    const mostrarError = (mensaje) => {
        mostrarToast({
            message: mensaje,
            duration: 2000,
            color: 'danger',
            position: 'bottom',
        });
    };

    const manejarCorreo = (e) => {
        e.preventDefault();
        const resultado = solicitarRecuperacion({ correo });
        if (!resultado.ok) {
            mostrarError(resultado.mensaje);
            return;
        }
        setPaso('clave');
    };

    const manejarClave = (e) => {
        e.preventDefault();
        const resultado = restablecerPassword({ correo, password, confirmar });
        if (!resultado.ok) {
            mostrarError(resultado.mensaje);
            return;
        }
        setPaso('listo');
    };

    return (
        <IonPage>
            <IonContent>
                <div className="login-container">
                    <div className="image-container">
                        <img className="logo-app" src={logo} alt="Logo" />
                        <h1>Recuperar contraseña</h1>
                        <p>
                            {paso === 'correo' && 'Ingresa el correo de tu cuenta'}
                            {paso === 'clave' && 'Elige una contraseña nueva'}
                            {paso === 'listo' && 'Ya puedes iniciar sesión con tu nueva contraseña'}
                        </p>
                    </div>
                    {paso === 'correo' && (
                        <form onSubmit={manejarCorreo} className="login-form">
                            <IonInput
                                value={correo}
                                onIonInput={(e) => setCorreo(e.detail.value)}
                                labelPlacement="floating"
                                className="custom-input"
                                type="email"
                                label="Correo electrónico"
                                fill="outline"
                                shape="round"
                                color="primary"
                            />
                            <IonButton className="login-button" type="submit" expand="block">
                                Continuar
                            </IonButton>
                            <Link to="/" className="auth-back">
                                Volver a iniciar sesión
                            </Link>
                        </form>
                    )}
                    {paso === 'clave' && (
                        <form onSubmit={manejarClave} className="login-form">
                            <IonInput
                                value={password}
                                onIonInput={(e) => setPassword(e.detail.value)}
                                labelPlacement="floating"
                                className="custom-input"
                                type="password"
                                label="Nueva contraseña"
                                fill="outline"
                                shape="round"
                                color="primary"
                            >
                                <div className="toggle-icon" slot="end">
                                    <IonInputPasswordToggle />
                                </div>
                            </IonInput>
                            <IonInput
                                value={confirmar}
                                onIonInput={(e) => setConfirmar(e.detail.value)}
                                labelPlacement="floating"
                                className="custom-input"
                                type="password"
                                label="Confirmar contraseña"
                                fill="outline"
                                shape="round"
                                color="primary"
                            >
                                <div className="toggle-icon" slot="end">
                                    <IonInputPasswordToggle />
                                </div>
                            </IonInput>
                            <IonButton className="login-button" type="submit" expand="block">
                                Guardar contraseña
                            </IonButton>
                            <Link to="/" className="auth-back">
                                Volver a iniciar sesión
                            </Link>
                        </form>
                    )}
                    {paso === 'listo' && (
                        <div className="login-form">
                            <div className="auth-success">
                                <p>Tu contraseña se actualizó. Inicia sesión con el correo {correo.trim().toLowerCase()}.</p>
                            </div>
                            <IonButton className="login-button" expand="block" onClick={() => router.push('/', 'root', 'replace')}>
                                Ir a iniciar sesión
                            </IonButton>
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
}

export default Recuperar;
