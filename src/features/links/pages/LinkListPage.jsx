import React, { useCallback, useEffect, useState } from 'react';
import './LinkListPage.css';
import LinkCard from '../components/LinkCard.jsx';
import LinkFormModal from '../components/LinkFormModal.jsx';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonAvatar,
    IonSearchbar,
    IonFab,
    IonFabButton,
    IonButton,
    IonIcon,
    useIonRouter,
    useIonToast,
    useIonAlert,
} from '@ionic/react';
import { linkOutline, searchOutline } from 'ionicons/icons';
import FilterButtons from '../components/FilterButtons.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { linkService } from '../services/linkService.js';
import { tagService } from '../../tags/services/tagService.js';

const Home = () => {
    const { usuario } = useAuth();
    const router = useIonRouter();
    const [mostrarToast] = useIonToast();
    const [presentarAlerta] = useIonAlert();

    const [links, setLinks] = useState([]);
    const [etiquetas, setEtiquetas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [textoBusqueda, setTextoBusqueda] = useState('');
    const [categoriasActivas, setCategoriasActivas] = useState([]);

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        const [resultadoLinks, resultadoEtiquetas] = await Promise.allSettled([
            linkService.listar(),
            tagService.listar(),
        ]);

        if (resultadoLinks.status === 'fulfilled' && resultadoLinks.value.ok) {
            setLinks(resultadoLinks.value.datos);
        } else {
            const mensaje = resultadoLinks.status === 'fulfilled'
                ? resultadoLinks.value.mensaje
                : 'No se pudieron cargar tus enlaces.';
            mostrarToast({
                message: mensaje,
                duration: 2500,
                color: 'danger',
                position: 'bottom',
            });
        }

        if (resultadoEtiquetas.status === 'fulfilled' && resultadoEtiquetas.value.ok) {
            setEtiquetas(resultadoEtiquetas.value.datos);
        }

        setCargando(false);
    }, [mostrarToast]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const manejarFiltro = (categoriaClic) => {
        if (categoriaClic === 'Todos') {
            setCategoriasActivas([]);
            return;
        }
        if (categoriasActivas.includes(categoriaClic)) {
            setCategoriasActivas(categoriasActivas.filter((c) => c !== categoriaClic));
        } else {
            setCategoriasActivas([...categoriasActivas, categoriaClic]);
        }
    };

    const manejarEliminar = (link) => {
        presentarAlerta({
            header: 'Eliminar enlace',
            message: `¿Deseas eliminar "${link.titulo}"? Esta acción no se puede deshacer.`,
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: async () => {
                        const resultado = await linkService.eliminar(link.id);
                        if (!resultado.ok) {
                            mostrarToast({
                                message: resultado.mensaje,
                                duration: 2500,
                                color: 'danger',
                                position: 'bottom',
                            });
                            return;
                        }
                        setLinks((previos) => previos.filter((item) => item.id !== link.id));
                        mostrarToast({
                            message: 'Enlace eliminado.',
                            duration: 2000,
                            color: 'success',
                            position: 'bottom',
                        });
                    },
                },
            ],
        });
    };

    const tarjetasFiltradas = links.filter((link) => {
        const coincideTexto = link.titulo.toLowerCase().includes(textoBusqueda.toLowerCase());
        const coincideCategoria =
            categoriasActivas.length === 0 ||
            categoriasActivas.some((cat) => link.etiquetas.includes(cat));
        return coincideTexto && coincideCategoria;
    });

    const limpiarFiltros = () => {
        setTextoBusqueda('');
        setCategoriasActivas([]);
    };

    const hayFiltros = textoBusqueda.trim() !== '' || categoriasActivas.length > 0;
    const opcionesFiltro = ['Todos', ...etiquetas.map((etq) => etq.nombre)];

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="header">
                    <div className="header-info">
                        <h1>Mi Baul</h1>
                        <p>{links.length} {links.length === 1 ? 'link guardado' : 'links guardados'}</p>
                    </div>
                    <IonAvatar slot="end" className="avatar" style={{ backgroundColor: usuario?.avatarColor ?? '#2563eb' }} onClick={() => router.push('/pages/Perfil', 'forward', 'push')}>
                        <span>{usuario?.iniciales ?? '?'}</span>
                    </IonAvatar>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonSearchbar
                    className="searchBar"
                    type="text"
                    placeholder="Buscar en tu baúl..."
                    value={textoBusqueda}
                    onIonInput={(e) => setTextoBusqueda(e.detail.value ?? '')}
                    shape="round"
                    aria-label="Buscar links"
                />
                {etiquetas.length > 0 && (
                    <FilterButtons opciones={opcionesFiltro} activas={categoriasActivas} onToggle={manejarFiltro} />
                )}
                {cargando ? (
                    <div className="list-card">
                        {[0, 1, 2].map((i) => (
                            <div className="link-skeleton" key={i}>
                                <div className="skeleton link-skeleton-img" />
                                <div className="link-skeleton-cuerpo">
                                    <div className="skeleton link-skeleton-linea link-skeleton-linea--titulo" />
                                    <div className="skeleton link-skeleton-linea" />
                                    <div className="skeleton link-skeleton-linea link-skeleton-linea--corta" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : tarjetasFiltradas.length === 0 ? (
                    <div className="estado-vacio">
                        <div className="estado-vacio-icono">
                            <IonIcon icon={hayFiltros ? searchOutline : linkOutline} aria-hidden="true" />
                        </div>
                        {hayFiltros ? (
                            <>
                                <h3>Sin resultados</h3>
                                <p>No encontramos links que coincidan con tu búsqueda o filtros.</p>
                                <IonButton className="estado-vacio-boton" onClick={limpiarFiltros}>Limpiar filtros</IonButton>
                            </>
                        ) : (
                            <>
                                <h3>Tu baúl está vacío</h3>
                                <p>Empieza a guardar tus links favoritos para tenerlos siempre a mano.</p>
                                <IonButton className="estado-vacio-boton" onClick={() => setMostrarModal(true)}>Guarda tu primer link</IonButton>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="list-card">
                        {tarjetasFiltradas.map((link) => (
                            <LinkCard
                                key={link.id}
                                titulo={link.titulo}
                                url={link.url}
                                imagen={link.imagen}
                                tiempo={link.tiempo}
                                etiquetas={link.etiquetas}
                                onEliminar={() => manejarEliminar(link)}
                            />
                        ))}
                    </div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton aria-label="Guardar nuevo link" onClick={() => setMostrarModal(true)}>
                        +
                    </IonFabButton>
                </IonFab>
                <LinkFormModal
                    isOpen={mostrarModal}
                    cerrarModal={() => setMostrarModal(false)}
                    etiquetas={etiquetas}
                    onGuardado={cargarDatos}
                />
            </IonContent>
        </IonPage>
    );
};

export default Home;
