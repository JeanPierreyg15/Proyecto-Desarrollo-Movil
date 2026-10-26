import { IonPage, IonContent, IonInput, IonButton, useIonToast, IonInputPasswordToggle, useIonRouter } from '@ionic/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/logo.svg';
import '../auth.css';
import './PasswordRecoveryPage.css';

function Recuperar() {
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [paso, setPaso] = useState('correo');
    const [intentoEnviar, setIntentoEnviar] = useState(false);
    const [procesando, setProcesando] = useState(false);
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

    const manejarCorreo = async (e) => {
        e.preventDefault();
        setIntentoEnviar(true);
        if (!correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
            return;
        }

        setProcesando(true);
        await new Promise((resolve) => window.requestAnimationFrame(resolve));
        const resultado = await solicitarRecuperacion({ correo });
        if (!resultado.ok) {
            mostrarError(resultado.mensaje);
            setProcesando(false);
            return;
        }
        setPaso('clave');
        setIntentoEnviar(false);
        setProcesando(false);
    };

    const manejarClave = async (e) => {
        e.preventDefault();
        setIntentoEnviar(true);
        if (password.length < 6 || !confirmar || password !== confirmar) {
            return;
        }

        setProcesando(true);
        await new Promise((resolve) => window.requestAnimationFrame(resolve));
        const resultado = await restablecerPassword({ correo, password, confirmar });
        if (!resultado.ok) {
            mostrarError(resultado.mensaje);
            setProcesando(false);
            return;
        }
        setPaso('listo');
        setProcesando(false);
    };

    const errorCorreo = intentoEnviar && paso === 'correo'
        ? !correo.trim()
            ? 'Ingresa tu correo electrónico.'
            : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
              ? 'Ingresa un correo electrónico válido.'
              : ''
        : '';
    const errorPassword = intentoEnviar && paso === 'clave' && password.length < 6
        ? 'Usa al menos 6 caracteres.'
        : '';
    const errorConfirmar = intentoEnviar && paso === 'clave'
        ? !confirmar
            ? 'Confirma tu contraseña.'
            : password !== confirmar
              ? 'Las contraseñas no coinciden.'
              : ''
        : '';

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
                    {paso !== 'listo' && (
                        <div className="auth-notice" role="note">
                            Modo demostración: los datos solo se conservan durante esta sesión y no se envía ningún correo.
                        </div>
                    )}
                    {paso === 'correo' && (
                        <form onSubmit={manejarCorreo} className="login-form" noValidate aria-busy={procesando}>
                            <IonInput
                                value={correo}
                                onIonInput={(e) => setCorreo(e.detail.value ?? '')}
                                labelPlacement="floating"
                                className="custom-input"
                                type="email"
                                label="Correo electrónico"
                                fill="outline"
                                shape="round"
                                color="primary"
                                autocomplete="email"
                                inputmode="email"
                                aria-invalid={Boolean(errorCorreo)}
                                aria-describedby={errorCorreo ? 'recuperar-correo-error' : undefined}
                            />
                            {errorCorreo && <p className="auth-field-error" id="recuperar-correo-error" role="alert">{errorCorreo}</p>}
                            <IonButton className="login-button" type="submit" expand="block" disabled={procesando}>
                                {procesando ? 'Verificando...' : 'Continuar'}
                            </IonButton>
                            <Link to="/" className="auth-back">
                                Volver a iniciar sesión
                            </Link>
                        </form>
                    )}
                    {paso === 'clave' && (
                        <form onSubmit={manejarClave} className="login-form" noValidate aria-busy={procesando}>
                            <IonInput
                                value={password}
                                onIonInput={(e) => setPassword(e.detail.value ?? '')}
                                labelPlacement="floating"
                                className="custom-input"
                                type="password"
                                label="Nueva contraseña"
                                fill="outline"
                                shape="round"
                                color="primary"
                                autocomplete="new-password"
                                aria-invalid={Boolean(errorPassword)}
                                aria-describedby={errorPassword
                                    ? 'recuperar-password-ayuda recuperar-password-error'
                                    : 'recuperar-password-ayuda'}
                            >
                                <div className="toggle-icon" slot="end">
                                    <IonInputPasswordToggle />
                                </div>
                            </IonInput>
                            <p className="auth-field-hint" id="recuperar-password-ayuda">Usa al menos 6 caracteres.</p>
                            {errorPassword && <p className="auth-field-error" id="recuperar-password-error" role="alert">{errorPassword}</p>}
                            <IonInput
                                value={confirmar}
                                onIonInput={(e) => setConfirmar(e.detail.value ?? '')}
                                labelPlacement="floating"
                                className="custom-input"
                                type="password"
                                label="Confirmar contraseña"
                                fill="outline"
                                shape="round"
                                color="primary"
                                autocomplete="new-password"
                                aria-invalid={Boolean(errorConfirmar)}
                                aria-describedby={errorConfirmar ? 'recuperar-confirmar-error' : undefined}
                            >
                                <div className="toggle-icon" slot="end">
                                    <IonInputPasswordToggle />
                                </div>
                            </IonInput>
                            {errorConfirmar && <p className="auth-field-error" id="recuperar-confirmar-error" role="alert">{errorConfirmar}</p>}
                            <IonButton className="login-button" type="submit" expand="block" disabled={procesando}>
                                {procesando ? 'Actualizando...' : 'Guardar contraseña'}
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
