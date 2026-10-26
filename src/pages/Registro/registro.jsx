import { IonPage, IonContent, IonInput, IonButton, useIonToast, IonInputPasswordToggle } from '@ionic/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../Login/media/logo.svg';
import '../Login/login.css';

function Registro() {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [mostrarToast] = useIonToast();
    const navigate = useNavigate();
    const { registrar } = useAuth();

    const manejarRegistro = (e) => {
        e.preventDefault();
        const resultado = registrar({ nombre, correo, password, confirmar });
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
                        <h1>Crea tu cuenta</h1>
                        <p>Guarda tus links en un solo baúl</p>
                    </div>
                    <form onSubmit={manejarRegistro} className="login-form">
                        <IonInput
                            value={nombre}
                            onIonInput={(e) => setNombre(e.detail.value)}
                            labelPlacement="floating"
                            className="custom-input"
                            type="text"
                            label="Nombre"
                            fill="outline"
                            shape="round"
                            color="primary"
                        />
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
                            Crear cuenta
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
