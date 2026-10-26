import { IonPage, IonContent, IonInput, IonButton, useIonToast, IonInputPasswordToggle, useIonRouter } from '@ionic/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../Login/media/logo.svg';
import '../Login/login.css';

function Registro() {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [intentoEnviar, setIntentoEnviar] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [mostrarToast] = useIonToast();
    const router = useIonRouter();
    const { registrar } = useAuth();

    const errorNombre = intentoEnviar && !nombre.trim() ? 'Ingresa tu nombre completo.' : '';
    const errorCorreo = intentoEnviar
        ? !correo.trim()
            ? 'Ingresa tu correo electrónico.'
            : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
              ? 'Ingresa un correo electrónico válido.'
              : ''
        : '';
    const errorPassword = intentoEnviar && password.length < 6
        ? 'Usa al menos 6 caracteres.'
        : '';
    const errorConfirmar = intentoEnviar
        ? !confirmar
            ? 'Confirma tu contraseña.'
            : password !== confirmar
              ? 'Las contraseñas no coinciden.'
              : ''
        : '';

    const manejarRegistro = async (e) => {
        e.preventDefault();
        setIntentoEnviar(true);
        const correoInvalido = !correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
        if (!nombre.trim() || correoInvalido || password.length < 6 || !confirmar || password !== confirmar) {
            return;
        }

        setProcesando(true);
        await new Promise((resolve) => window.requestAnimationFrame(resolve));
        const resultado = registrar({ nombre, correo, password, confirmar });
        if (!resultado.ok) {
            mostrarToast({
                message: resultado.mensaje,
                duration: 2000,
                color: 'danger',
                position: 'bottom',
            });
            setProcesando(false);
            return;
        }
        router.push('/pages/Home', 'root', 'replace');
    };

    return (
        <IonPage>
            <IonContent>
                <div className="login-container">
                    <div className="image-container">
                        <img className="logo-app" src={logo} alt="Logo" />
                        <h1>Crea tu cuenta</h1>
                        <p>Guarda tus links en un solo baúl</p>
                    </div>
                    <form onSubmit={manejarRegistro} className="login-form" noValidate aria-busy={procesando}>
                        <IonInput
                            value={nombre}
                            onIonInput={(e) => setNombre(e.detail.value ?? '')}
                            labelPlacement="floating"
                            className="custom-input"
                            type="text"
                            label="Nombre"
                            fill="outline"
                            shape="round"
                            color="primary"
                            autocomplete="name"
                            aria-invalid={Boolean(errorNombre)}
                            aria-describedby={errorNombre ? 'registro-nombre-error' : undefined}
                        />
                        {errorNombre && <p className="auth-field-error" id="registro-nombre-error" role="alert">{errorNombre}</p>}
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
                            aria-describedby={errorCorreo ? 'registro-correo-error' : undefined}
                        />
                        {errorCorreo && <p className="auth-field-error" id="registro-correo-error" role="alert">{errorCorreo}</p>}
                        <IonInput
                            value={password}
                            onIonInput={(e) => setPassword(e.detail.value ?? '')}
                            labelPlacement="floating"
                            className="custom-input"
                            type="password"
                            label="Contraseña"
                            fill="outline"
                            shape="round"
                            color="primary"
                            autocomplete="new-password"
                            aria-invalid={Boolean(errorPassword)}
                            aria-describedby={errorPassword
                                ? 'registro-password-ayuda registro-password-error'
                                : 'registro-password-ayuda'}
                        >
                            <div className="toggle-icon" slot="end">
                                <IonInputPasswordToggle />
                            </div>
                        </IonInput>
                        <p className="auth-field-hint" id="registro-password-ayuda">La contraseña debe tener al menos 6 caracteres.</p>
                        {errorPassword && <p className="auth-field-error" id="registro-password-error" role="alert">{errorPassword}</p>}
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
                            aria-describedby={errorConfirmar ? 'registro-confirmar-error' : undefined}
                        >
                            <div className="toggle-icon" slot="end">
                                <IonInputPasswordToggle />
                            </div>
                        </IonInput>
                        {errorConfirmar && <p className="auth-field-error" id="registro-confirmar-error" role="alert">{errorConfirmar}</p>}
                        <IonButton className="login-button" type="submit" expand="block" disabled={procesando}>
                            {procesando ? 'Creando cuenta...' : 'Crear cuenta'}
                        </IonButton>
                    </form>
                    <div className="register-container">
                        <p>
                            ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
                        </p>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}

export default Registro;
