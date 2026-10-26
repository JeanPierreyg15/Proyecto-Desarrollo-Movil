import { useEffect, useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonInput,
    IonTextarea,
    IonButton,
    IonIcon,
    useIonToast,
    useIonRouter,
} from '@ionic/react';
import { createOutline, linkOutline } from 'ionicons/icons';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import './ProfilePage.css';

function Perfil() {
    const { usuario, actualizarPerfil, cerrarSesion } = useAuth();
    const [nombre, setNombre] = useState(usuario?.nombre ?? '');
    const [correo, setCorreo] = useState(usuario?.correo ?? '');
    const [bio, setBio] = useState('');
    const [mostrarToast] = useIonToast();
    const router = useIonRouter();

    useEffect(() => {
        setNombre(usuario?.nombre ?? '');
        setCorreo(usuario?.correo ?? '');
    }, [usuario]);

    const manejarGuardar = async (e) => {
        e.preventDefault();
        const resultado = await actualizarPerfil({ nombre, correo });
        mostrarToast({
            message: resultado.ok ? 'Perfil actualizado' : resultado.mensaje,
            duration: 2000,
            color: resultado.ok ? 'success' : 'danger',
            position: 'bottom',
        });
    };

    const manejarCerrarSesion = async () => {
        await cerrarSesion();
        router.push('/', 'root', 'replace');
    };

    const manejarEditarAvatar = () => {
        mostrarToast({
            message: 'La edición de foto estará disponible próximamente.',
            duration: 2000,
            color: 'medium',
            position: 'bottom',
        });
    };

    const manejarEliminarCuenta = () => {
        mostrarToast({
            message: 'La eliminación de cuenta estará disponible próximamente.',
            duration: 2500,
            color: 'medium',
            position: 'bottom',
        });
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
                        <IonButton className="login-button" expand="block" onClick={() => router.push('/', 'root', 'replace')}>
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
            <IonContent className="ion-padding perfil-content">
                <div className="perfil-page">
                    <section className="perfil-avatar" aria-label="Información del perfil">
                        <div className="avatar-container">
                            <div className="avatar-grande" aria-label={`Iniciales de ${usuario.nombre}`}>
                                {usuario.iniciales}
                            </div>
                            <IonButton
                                className="avatar-edit"
                                fill="solid"
                                aria-label="Editar foto de perfil"
                                onClick={manejarEditarAvatar}
                            >
                                <IonIcon icon={createOutline} aria-hidden="true" />
                            </IonButton>
                        </div>
                        <h2>{usuario.nombre}</h2>
                        <p className="perfil-correo">{usuario.correo}</p>
                    </section>

                    <section className="perfil-estadisticas" aria-label="Estadísticas de la cuenta">
                        <div className="estadistica">
                            <strong>8</strong>
                            <span>Links</span>
                        </div>
                        <div className="estadistica">
                            <strong>4</strong>
                            <span>Etiquetas</span>
                        </div>
                        <div className="estadistica">
                            <strong>23</strong>
                            <span>Días activo</span>
                        </div>
                    </section>

                    <form onSubmit={manejarGuardar} className="perfil-form">
                        <div className="perfil-campo">
                            <label htmlFor="perfil-nombre">NOMBRE COMPLETO</label>
                            <IonInput
                                id="perfil-nombre"
                                value={nombre}
                                onIonInput={(e) => setNombre(e.detail.value ?? '')}
                                className="perfil-input"
                                type="text"
                                placeholder="Juan Díaz"
                                fill="outline"
                            />
                        </div>
                        <div className="perfil-campo">
                            <label htmlFor="perfil-correo">CORREO ELECTRÓNICO</label>
                            <IonInput
                                id="perfil-correo"
                                value={correo}
                                onIonInput={(e) => setCorreo(e.detail.value ?? '')}
                                className="perfil-input"
                                type="email"
                                placeholder="juan@ejemplo.com"
                                fill="outline"
                            />
                        </div>
                        <div className="perfil-campo">
                            <label htmlFor="perfil-bio">BIO</label>
                            <div className="perfil-bio-contenedor">
                                <IonTextarea
                                    id="perfil-bio"
                                    value={bio}
                                    onIonInput={(e) => setBio(e.detail.value ?? '')}
                                    className="perfil-input perfil-bio"
                                    placeholder="Guardando los mejores links de la web"
                                    fill="outline"
                                    rows={3}
                                />
                                <IonIcon className="perfil-bio-icono" icon={linkOutline} aria-hidden="true" />
                            </div>
                        </div>
                        <div className="perfil-campo">
                            <label htmlFor="perfil-password">CONTRASEÑA ACTUAL</label>
                            <IonInput
                                id="perfil-password"
                                className="perfil-input"
                                type="password"
                                placeholder="Ingresa tu contraseña actual"
                                fill="outline"
                            />
                        </div>

                        <IonButton className="perfil-guardar" type="submit" expand="block">
                            Guardar cambios
                        </IonButton>
                        <IonButton
                            className="perfil-cerrar-sesion"
                            expand="block"
                            fill="clear"
                            type="button"
                            onClick={manejarCerrarSesion}
                        >
                            Cerrar sesión
                        </IonButton>
                        <IonButton
                            className="perfil-eliminar"
                            expand="block"
                            fill="outline"
                            type="button"
                            onClick={manejarEliminarCuenta}
                        >
                            Eliminar cuenta
                        </IonButton>
                    </form>
                </div>
            </IonContent>
        </IonPage>
    );
}

export default Perfil;
