import { IonPage, IonContent, IonInput, IonButton, useIonToast, IonInputPasswordToggle } from '@ionic/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './login.css';
import logo from './media/logo.svg';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarToast] = useIonToast();
    const navigate = useNavigate();
    const { iniciarSesion } = useAuth();

    const manejarLogin = (e) => {
        e.preventDefault();
        const resultado = iniciarSesion({ correo: email, password });
        if (!resultado.ok) {
            mostrarToast({
                message: resultado.mensaje,
                duration: 2000,
                color: 'danger',
                position: 'bottom',
            });
            return;
        }
        navigate('/pages/Home');
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
                    <form onSubmit={manejarLogin} className="login-form">
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
                        />
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
                        >
                            <div className="toggle-icon" slot="end">
                                <IonInputPasswordToggle />
                            </div>
                        </IonInput>
                        <Link className="recuperar-link" to="/recuperar">
                            ¿Olvidaste tu contraseña?
                        </Link>
                        <IonButton className="login-button" type="submit" expand="block">
                            Iniciar Sesión
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
