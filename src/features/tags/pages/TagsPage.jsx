import { useCallback, useState } from 'react';
import TagCard from '../components/TagCard.jsx';
import {
    IonContent,
    IonGrid,
    IonHeader,
    IonInput,
    IonModal,
    IonPage,
    IonRow,
    IonCol,
    IonToolbar,
    useIonRouter,
    useIonToast,
    useIonAlert,
    useIonActionSheet,
    useIonViewWillEnter,
} from '@ionic/react';
import './TagsPage.css';
import { tagService } from '../services/tagService.js';
import { linkService } from '../../links/services/linkService.js';

const ICONOS_ETIQUETA = ['🏷️', '💻', '🎨', '📚', '🎵', '🎬', '📰', '🍳', '💼', '🛒', '✈️', '⚽', '🔧', '🧪', '🎮'];

const TagsPage = () => {
    const [etiquetas, setEtiquetas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [etiquetaEditando, setEtiquetaEditando] = useState(null);
    const [nombreForm, setNombreForm] = useState('');
    const [iconoForm, setIconoForm] = useState(ICONOS_ETIQUETA[0]);
    const [guardando, setGuardando] = useState(false);
    const [mostrarToast] = useIonToast();
    const [presentarAlerta] = useIonAlert();
    const [presentarAcciones] = useIonActionSheet();
    const router = useIonRouter();

    const avisar = useCallback(
        (mensaje, color = 'success') =>
            mostrarToast({ message: mensaje, duration: 2200, color, position: 'bottom' }),
        [mostrarToast]
    );

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        const [resultadoEtiquetas, resultadoLinks] = await Promise.allSettled([
            tagService.listar(),
            linkService.listar(),
        ]);

        if (resultadoEtiquetas.status === 'fulfilled' && resultadoEtiquetas.value.ok) {
            const datosLinks = (resultadoLinks.status === 'fulfilled' && resultadoLinks.value.ok)
                ? resultadoLinks.value.datos
                : [];
            setEtiquetas(
                resultadoEtiquetas.value.datos.map((etiqueta) => ({
                    ...etiqueta,
                    cantidad: datosLinks.filter((link) => (link.etiquetas ?? []).includes(etiqueta.nombre)).length,
                }))
            );
        } else {
            const mensaje = resultadoEtiquetas.status === 'fulfilled'
                ? resultadoEtiquetas.value.mensaje
                : 'No se pudieron cargar las etiquetas.';
            avisar(mensaje, 'danger');
        }

        setCargando(false);
    }, [avisar]);

    useIonViewWillEnter(() => {
        cargarDatos();
    });

    const abrirCrear = () => {
        setEtiquetaEditando(null);
        setNombreForm('');
        setIconoForm(ICONOS_ETIQUETA[0]);
        setGuardando(false);
        setModalAbierto(true);
    };

    const abrirEditar = (etiqueta) => {
        setEtiquetaEditando(etiqueta);
        setNombreForm(etiqueta.nombre);
        setIconoForm(etiqueta.icono || ICONOS_ETIQUETA[0]);
        setGuardando(false);
        setModalAbierto(true);
    };

    const guardarEtiqueta = async () => {
        if (guardando) {
            return;
        }
        setGuardando(true);
        const datos = { nombre: nombreForm, icono: iconoForm };
        const resultado = etiquetaEditando
            ? await tagService.actualizar(etiquetaEditando.id, datos)
            : await tagService.crear(datos);
        setGuardando(false);

        if (!resultado.ok) {
            avisar(resultado.mensaje, 'danger');
            return;
        }
        avisar(etiquetaEditando ? 'Etiqueta actualizada.' : 'Etiqueta creada con éxito.');
        setModalAbierto(false);
        cargarDatos();
    };

    const eliminarEtiqueta = (etiqueta) => {
        presentarAlerta({
            header: 'Eliminar etiqueta',
            message: `Se eliminará "${etiqueta.nombre}". Los links que la usan se conservan, pero perderán esta etiqueta.`,
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: async () => {
                        const resultado = await tagService.eliminar(etiqueta.id);
                        if (!resultado.ok) {
                            avisar(resultado.mensaje, 'danger');
                            return;
                        }
                        setEtiquetas((previas) => previas.filter((item) => item.id !== etiqueta.id));
                        avisar('Etiqueta eliminada.');
                    },
                },
            ],
        });
    };

    const verLinksDeEtiqueta = (etiqueta) => {
        router.push(`/pages/Home?etiqueta=${encodeURIComponent(etiqueta.nombre)}`, 'forward', 'push');
    };

    const manejarSeleccionEtiqueta = (etiqueta) => {
        presentarAcciones({
            header: etiqueta.nombre,
            subHeader: `${etiqueta.cantidad} ${etiqueta.cantidad === 1 ? 'link' : 'links'}`,
            buttons: [
                { text: 'Ver links', handler: () => verLinksDeEtiqueta(etiqueta) },
                { text: 'Renombrar', handler: () => abrirEditar(etiqueta) },
                { text: 'Eliminar', role: 'destructive', handler: () => eliminarEtiqueta(etiqueta) },
                { text: 'Cancelar', role: 'cancel' },
            ],
        });
    };

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <div className="header-info">
                        <h1>Etiquetas</h1>
                        <p>{etiquetas.length} {etiquetas.length === 1 ? 'categoría' : 'categorías'}</p>
                    </div>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonGrid>
                    <IonRow>
                        {cargando ? (
                            [0, 1, 2, 3].map((i) => (
                                <IonCol size="6" key={i}>
                                    <div className="tag-skeleton">
                                        <div className="skeleton tag-skeleton-icono" />
                                        <div className="skeleton tag-skeleton-linea" />
                                        <div className="skeleton tag-skeleton-linea tag-skeleton-linea--corta" />
                                    </div>
                                </IonCol>
                            ))
                        ) : (
                            <>
                                {etiquetas.map((etiqueta) => (
                                    <IonCol size="6" key={etiqueta.id}>
                                        <TagCard
                                            titulo={etiqueta.titulo}
                                            cantidad={etiqueta.cantidad}
                                            imagen={etiqueta.icono}
                                            onClick={() => manejarSeleccionEtiqueta(etiqueta)}
                                        />
                                    </IonCol>
                                ))}
                                <IonCol size="6">
                                    <button type="button" className="ghost-card" onClick={abrirCrear} aria-label="Crear nueva etiqueta">
                                        <div className="ghost-icon">
                                            <span className="plus-icon">+</span>
                                        </div>
                                    </button>
                                </IonCol>
                            </>
                        )}
                    </IonRow>
                </IonGrid>

                <IonModal
                    isOpen={modalAbierto}
                    onDidDismiss={() => setModalAbierto(false)}
                    initialBreakpoint={0.7}
                    breakpoints={[0, 0.7, 1]}
                >
                    <IonContent className="ion-padding">
                        <div className="tag-editor">
                            <h2>{etiquetaEditando ? 'Editar etiqueta' : 'Nueva etiqueta'}</h2>
                            <IonInput
                                value={nombreForm}
                                onIonInput={(e) => setNombreForm(e.detail.value ?? '')}
                                label="Nombre"
                                labelPlacement="floating"
                                fill="outline"
                                maxlength={40}
                                className="tag-editor-input"
                            />
                            <p className="tag-editor-label">Elige un icono</p>
                            <div className="icono-grid" role="group" aria-label="Icono de la etiqueta">
                                {ICONOS_ETIQUETA.map((icono) => (
                                    <button
                                        type="button"
                                        key={icono}
                                        className={`icono-opcion ${icono === iconoForm ? 'activo' : ''}`}
                                        aria-pressed={icono === iconoForm}
                                        aria-label={`Icono ${icono}`}
                                        onClick={() => setIconoForm(icono)}
                                    >
                                        {icono}
                                    </button>
                                ))}
                            </div>
                            <div className="tag-editor-acciones">
                                <button type="button" className="tag-editor-cancelar" onClick={() => setModalAbierto(false)}>
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="tag-editor-guardar"
                                    disabled={guardando || !nombreForm.trim()}
                                    onClick={guardarEtiqueta}
                                >
                                    {guardando ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </IonContent>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default TagsPage;
