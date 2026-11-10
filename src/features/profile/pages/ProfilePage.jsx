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
    IonToggle,
    useIonToast,
    useIonRouter,
    useIonAlert,
} from '@ionic/react';
import {
    createOutline,
    personOutline,
    lockClosedOutline,
    logOutOutline,
    trashOutline,
    moonOutline,
    chevronForwardOutline,
    colorPaletteOutline,
} from 'ionicons/icons';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { aplicarTema } from '../../../app/theme.js';
import { linkService } from '../../links/services/linkService.js';
import { tagService } from '../../tags/services/tagService.js';
import './ProfilePage.css';

const COLORES_AVATAR = ['#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#16a34a', '#0891b2', '#475569'];

function Perfil() {
    const { usuario, actualizarPerfil, actualizarAvatar, eliminarCuenta, cerrarSesion } = useAuth();
    const [nombre, setNombre] = useState(usuario?.nombre ?? '');
    const [correo, setCorreo] = useState(usuario?.correo ?? '');
    const [bio, setBio] = useState('');
    const [oscuro, setOscuro] = useState(() =>
        document.documentElement.classList.contains('ion-palette-dark')
    );

    const [mostrarToast] = useIonToast();
    const [presentarAlerta] = useIonAlert();
    const router = useIonRouter();

    // Estadísticas reales dentro de la sesión actual (antes eran números inventados)
    const [estadisticas, setEstadisticas] = useState({ links: 0, etiquetas: 0 });
    useEffect(() => {
        let activo = true;
        Promise.allSettled([linkService.listar(), tagService.listar()]).then(
            ([resultadoLinks, resultadoEtiquetas]) => {
                if (!activo) {
                    return;
                }
                setEstadisticas({
                    links: (resultadoLinks.status === 'fulfilled' && resultadoLinks.value.ok)
                        ? resultadoLinks.value.datos.length
                        : 0,
                    etiquetas: (resultadoEtiquetas.status === 'fulfilled' && resultadoEtiquetas.value.ok)
                        ? resultadoEtiquetas.value.datos.length
                        : 0,
                });
            }
        );
        return () => {
            activo = false;
        };
    }, []);

    useEffect(() => {
        setNombre(usuario?.nombre ?? '');
        setCorreo(usuario?.correo ?? '');
    }, [usuario]);

    const manejarGuardar = async (e) => {
        e.preventDefault();
        const resultado = await actualizarPerfil({ nombre });
        mostrarToast({
            message: resultado.ok ? 'Perfil actualizado' : resultado.mensaje,
            duration: 2000,
            color: resultado.ok ? 'success' : 'danger',
            position: 'bottom',
        });
    };

    const cambiarTema = (valor) => {
        setOscuro(valor);
        aplicarTema(valor);
    };

    const colorAvatar = usuario?.avatarColor ?? '#2563eb';

    const manejarCerrarSesion = () => {
        presentarAlerta({
            header: 'Cerrar sesión',
            message: '¿Estás seguro de que deseas cerrar sesión?',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Cerrar sesión',
                    role: 'destructive',
                    handler: async () => {
                        await cerrarSesion();
                        router.push('/', 'root', 'replace');
                    },
                },
            ],
        });
    };

    const manejarEditarAvatar = () => {
        mostrarToast({ message: 'La edición de foto estará disponible próximamente.', duration: 2000, color: 'medium', position: 'bottom' });
    };

    const manejarEliminarCuenta = () => {
        presentarAlerta({
            header: 'Eliminar cuenta',
            message: 'Esta acción es permanente y borrará tu cuenta, todos tus links y tus etiquetas. ¿Deseas continuar?',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: async () => {
                        const resultado = await eliminarCuenta();
                        if (!resultado.ok) {
                            mostrarToast({ message: resultado.mensaje, duration: 2500, color: 'danger', position: 'bottom' });
                            return;
                        }
                        router.push('/', 'root', 'replace');
                    },
                },
            ],
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

                    {/* Avatar */}
                    <section className="perfil-avatar animar-entrada" aria-label="Información del perfil">
                        <div className="avatar-container">
                            <div
                                className="avatar-grande"
                                style={{ backgroundColor: colorAvatar }}
                                aria-label={`Iniciales de ${usuario.nombre}`}
                            >
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

                        <div className="avatar-colores" role="radiogroup" aria-label="Color del avatar">
                            {COLORES_AVATAR.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    role="radio"
                                    aria-checked={color === colorAvatar}
                                    aria-label={`Usar color ${color}`}
                                    className={`avatar-color ${color === colorAvatar ? 'avatar-color--activo' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => actualizarAvatar(color)}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Estadísticas */}
                    <section className="perfil-estadisticas" aria-label="Estadísticas de la cuenta">
                        <div className="estadistica">
                            <strong>{estadisticas.links}</strong>
                            <span>Links</span>
                        </div>
                        <div className="estadistica">
                            <strong>{estadisticas.etiquetas}</strong>
                            <span>Etiquetas</span>
                        </div>
                    </section>

                    {/* Sección: Información personal */}
                    <div className="perfil-seccion">
                        <div className="perfil-seccion-titulo">
                            <IonIcon icon={personOutline} aria-hidden="true" />
                            <span>Información personal</span>
                        </div>
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
                                    disabled
                                    className="perfil-input"
                                    type="email"
                                    placeholder="juan@ejemplo.com"
                                    fill="outline"
                                />
                                <p className="perfil-correo-nota">El cambio de correo no está disponible en esta versión.</p>
                            </div>
                            <div className="perfil-campo">
                                <label htmlFor="perfil-bio">BIO</label>
                                <IonTextarea
                                    id="perfil-bio"
                                    value={bio}
                                    onIonInput={(e) => setBio(e.detail.value ?? '')}
                                    className="perfil-input perfil-bio"
                                    placeholder="Cuéntanos algo sobre ti..."
                                    fill="outline"
                                    rows={3}
                                />
                            </div>
                            <IonButton className="perfil-guardar" type="submit" expand="block">
                                Guardar cambios
                            </IonButton>
                        </form>
                    </div>

                    {/* Sección: Apariencia */}
                    <div className="perfil-seccion">
                        <div className="perfil-seccion-titulo">
                            <IonIcon icon={colorPaletteOutline} aria-hidden="true" />
                            <span>Apariencia</span>
                        </div>
                        <div className="perfil-fila perfil-fila--toggle">
                            <span className="perfil-fila-icono">
                                <IonIcon icon={moonOutline} aria-hidden="true" />
                            </span>
                            <span className="perfil-fila-texto">Modo oscuro</span>
                            <IonToggle
                                checked={oscuro}
                                onIonChange={(e) => cambiarTema(e.detail.checked)}
                                aria-label="Activar modo oscuro"
                            />
                        </div>
                    </div>

                    {/* Sección: Seguridad */}
                    <div className="perfil-seccion">
                        <div className="perfil-seccion-titulo">
                            <IonIcon icon={lockClosedOutline} aria-hidden="true" />
                            <span>Seguridad</span>
                        </div>
                        <button
                            type="button"
                            className="perfil-fila perfil-fila--boton"
                            onClick={() => router.push('/cambiar-contrasena', 'forward', 'push')}
                        >
                            <span className="perfil-fila-icono">
                                <IonIcon icon={lockClosedOutline} aria-hidden="true" />
                            </span>
                            <span className="perfil-fila-texto">Cambiar contraseña</span>
                            <IonIcon className="perfil-fila-chevron" icon={chevronForwardOutline} aria-hidden="true" />
                        </button>
                    </div>

                    {/* Sección: Cuenta */}
                    <div className="perfil-seccion perfil-seccion-cuenta">
                        <div className="perfil-seccion-titulo">
                            <IonIcon icon={logOutOutline} aria-hidden="true" />
                            <span>Cuenta</span>
                        </div>
                        <div className="perfil-cuenta-acciones">
                            <IonButton
                                className="perfil-cerrar-sesion"
                                expand="block"
                                fill="outline"
                                type="button"
                                onClick={manejarCerrarSesion}
                            >
                                <IonIcon slot="start" icon={logOutOutline} aria-hidden="true" />
                                Cerrar sesión
                            </IonButton>
                            <IonButton
                                className="perfil-eliminar"
                                expand="block"
                                fill="outline"
                                type="button"
                                onClick={manejarEliminarCuenta}
                            >
                                <IonIcon slot="start" icon={trashOutline} aria-hidden="true" />
                                Eliminar cuenta
                            </IonButton>
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
}

export default Perfil;
