import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonAvatar,
    IonInput,
    IonButton,
    useIonToast,
} from '@ionic/react';
import { useAuth } from '../../context/AuthContext.jsx';
import './perfil.css';

function formatearFecha(iso) {
    if (!iso) {
        return '';
    }
    return new Date(iso).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function Perfil() {
    const { usuario, actualizarPerfil, cerrarSesion } = useAuth();
    const [nombre, setNombre] = useState(usuario?.nombre ?? '');
    const [correo, setCorreo] = useState(usuario?.correo ?? '');
    const [mostrarToast] = useIonToast();
    const navigate = useNavigate();

    useEffect(() => {
        setNombre(usuario?.nombre ?? '');
        setCorreo(usuario?.correo ?? '');
    }, [usuario]);

    const manejarGuardar = (e) => {
        e.preventDefault();
        const resultado = actualizarPerfil({ nombre, correo });
        mostrarToast({
            message: resultado.ok ? 'Perfil actualizado' : resultado.mensaje,
            duration: 2000,
            color: resultado.ok ? 'success' : 'danger',
            position: 'bottom',
        });
    };

    const manejarCerrarSesion = () => {
        cerrarSesion();
        navigate('/');
    };

    if (!usuario) {
        return (
            <IonPage>
                <IonHeader className="ion-no-border">
                    <IonToolbar>
                        <div className="header-info">
                            <h1>Perfil</h1>
                            <p>Tu cuenta en Locker</p>
                        </div>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <div className="perfil-vacio">
                        <p>Inicia sesión para ver y editar tu perfil.</p>
                        <IonButton className="login-button" expand="block" onClick={() => navigate('/')}>
                            Ir a iniciar sesión
                        </IonButton>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <div className="header-info">
                        <h1>Perfil</h1>
                        <p>Datos de tu cuenta</p>
                    </div>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div className="perfil-avatar">
                    <IonAvatar className="avatar-grande">
                        <span>{usuario.iniciales}</span>
                    </IonAvatar>
                    <p className="perfil-meta">Miembro desde {formatearFecha(usuario.creadoEn)}</p>
                </div>
                <form onSubmit={manejarGuardar} className="perfil-form">
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
                    <IonButton className="login-button" type="submit" expand="block">
                        Guardar cambios
                    </IonButton>
                    <IonButton
                        className="logout-button"
                        expand="block"
                        fill="outline"
                        color="danger"
                        type="button"
                        onClick={manejarCerrarSesion}
                    >
                        Cerrar sesión
                    </IonButton>
                </form>
            </IonContent>
        </IonPage>
    );
}

export default Perfil;
