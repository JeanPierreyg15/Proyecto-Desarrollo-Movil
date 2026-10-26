import { IonPage, IonContent, IonInput, IonButton, useIonToast, IonInputPasswordToggle, useIonRouter } from '@ionic/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './login.css';
import logo from './media/logo.svg';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [intentoEnviar, setIntentoEnviar] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [mostrarToast] = useIonToast();
    const router = useIonRouter();
    const { iniciarSesion } = useAuth();

    const errorCorreo = intentoEnviar
        ? !email.trim()
            ? 'Ingresa tu correo electrónico.'
            : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
              ? 'Ingresa un correo electrónico válido.'
              : ''
        : '';
    const errorPassword = intentoEnviar && !password ? 'Ingresa tu contraseña.' : '';

    const manejarLogin = async (e) => {
        e.preventDefault();
        setIntentoEnviar(true);
        const correoInvalido = !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
        if (correoInvalido || !password) {
            return;
        }

        setProcesando(true);
        await new Promise((resolve) => window.requestAnimationFrame(resolve));
        const resultado = iniciarSesion({ correo: email, password });
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
                        <h1>LOCKER</h1>
                        <p>Tu baúl personal de links</p>
                    </div>
                    <form onSubmit={manejarLogin} className="login-form" noValidate aria-busy={procesando}>
                        <IonInput
                            value={email}
                            onIonInput={(e) => setEmail(e.detail.value)}
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
                            aria-describedby={errorCorreo ? 'login-correo-error' : undefined}
                        />
                        {errorCorreo && <p className="auth-field-error" id="login-correo-error" role="alert">{errorCorreo}</p>}
                        <IonInput
                            value={password}
                            onIonInput={(e) => setPassword(e.detail.value)}
                            labelPlacement="floating"
                            className="custom-input"
                            type="password"
                            label="Contraseña"
                            fill="outline"
                            shape="round"
                            color="primary"
                            autocomplete="current-password"
                            aria-invalid={Boolean(errorPassword)}
                            aria-describedby={errorPassword ? 'login-password-error' : undefined}
                        >
                            <div className="toggle-icon" slot="end">
                                <IonInputPasswordToggle />
                            </div>
                        </IonInput>
                        {errorPassword && <p className="auth-field-error" id="login-password-error" role="alert">{errorPassword}</p>}
                        <Link className="recuperar-link" to="/recuperar">
                            ¿Olvidaste tu contraseña?
                        </Link>
                        <IonButton className="login-button" type="submit" expand="block" disabled={procesando}>
                            {procesando ? 'Validando...' : 'Iniciar Sesión'}
                        </IonButton>
                    </form>
                    <div className="register-container">
                        <p>
                            ¿No tienes Cuenta? <Link to="/registro">Regístrate</Link>
                        </p>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}

export default Login;
