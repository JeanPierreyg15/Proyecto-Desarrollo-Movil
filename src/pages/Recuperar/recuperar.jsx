import { IonPage, IonContent, IonInput, IonButton, useIonToast } from '@ionic/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../Login/media/logo.svg';
import '../Login/login.css';
import './recuperar.css';

function Recuperar() {
    const [correo, setCorreo] = useState('');
    const [enviado, setEnviado] = useState(false);
    const [mostrarToast] = useIonToast();
    const { solicitarRecuperacion } = useAuth();

    const manejarEnvio = (e) => {
        e.preventDefault();
        const resultado = solicitarRecuperacion({ correo });
        if (!resultado.ok) {
            mostrarToast({
                message: resultado.mensaje,
                duration: 2000,
                color: 'danger',
                position: 'bottom',
            });
            return;
        }
        setEnviado(true);
    };

    return (
        <IonPage>
            <IonContent>
                <div className="login-container">
                    <div className="image-container">
                        <img className="logo-app" src={logo} alt="Logo" />
                        <h1>Recuperar contraseña</h1>
                        <p>Te enviaremos un enlace a tu correo para crear una nueva</p>
                    </div>
                    {enviado ? (
                        <div className="login-form">
                            <div className="auth-success">
                                <p>Si el correo está registrado, te enviaremos las instrucciones.</p>
                            </div>
                            <Link to="/" className="auth-back">
                                Volver a iniciar sesión
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={manejarEnvio} className="login-form">
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
                                Enviar instrucciones
                            </IonButton>
                            <Link to="/" className="auth-back">
                                Volver a iniciar sesión
                            </Link>
                        </form>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
}

export default Recuperar;
