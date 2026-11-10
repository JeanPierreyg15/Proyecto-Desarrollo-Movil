import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './LinkListPage.css';
import LinkCard from '../components/LinkCard.jsx';
import LinkFormModal from '../components/LinkFormModal.jsx';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonSearchbar,
    IonFab,
    IonFabButton,
    IonButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    useIonRouter,
    useIonToast,
    useIonAlert,
    useIonActionSheet,
    useIonViewWillEnter,
} from '@ionic/react';
import { alertCircleOutline, linkOutline, refreshOutline, searchOutline } from 'ionicons/icons';
import FilterButtons from '../components/FilterButtons.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { linkService } from '../services/linkService.js';
import { tagService } from '../../tags/services/tagService.js';
import { abrirEnlace, compartirEnlace, copiarEnlace } from '../../../app/enlaces.js';

const TAMANO_PAGINA = 50;

const Home = () => {
    const { usuario } = useAuth();
    const router = useIonRouter();
    const location = useLocation();
    const [mostrarToast] = useIonToast();
    const [presentarAlerta] = useIonAlert();
    const [presentarAcciones] = useIonActionSheet();

    const [links, setLinks] = useState([]);
    const [totalLinks, setTotalLinks] = useState(0);
    const [hayMas, setHayMas] = useState(false);
    const [cargandoMas, setCargandoMas] = useState(false);
    const cargandoMasRef = useRef(false);
    const [etiquetas, setEtiquetas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [linkEditar, setLinkEditar] = useState(null);
    const [textoBusqueda, setTextoBusqueda] = useState('');
    const [categoriasActivas, setCategoriasActivas] = useState([]);

    const avisar = useCallback(
        (mensaje, color = 'success') =>
            mostrarToast({ message: mensaje, duration: 2200, color, position: 'bottom' }),
        [mostrarToast]
    );

    const cargarDatos = useCallback(
        async (silencioso = false) => {
            if (!silencioso) {
                setCargando(true);
            }
            const [resultadoLinks, resultadoEtiquetas, resultadoTotal] = await Promise.allSettled([
                linkService.listar({ limit: TAMANO_PAGINA }),
                tagService.listar(),
                linkService.contar(),
            ]);

            if (resultadoLinks.status === 'fulfilled' && resultadoLinks.value.ok) {
                setLinks(resultadoLinks.value.datos);
                setHayMas(resultadoLinks.value.datos.length === TAMANO_PAGINA);
                setErrorCarga(null);
            } else {
                const mensaje = resultadoLinks.status === 'fulfilled'
                    ? resultadoLinks.value.mensaje
                    : 'No se pudieron cargar tus enlaces.';
                setErrorCarga(mensaje);
                if (silencioso) {
                    avisar(mensaje, 'danger');
                }
            }

            if (resultadoEtiquetas.status === 'fulfilled' && resultadoEtiquetas.value.ok) {
                setEtiquetas(resultadoEtiquetas.value.datos);
            }

            if (resultadoTotal.status === 'fulfilled' && resultadoTotal.value.ok) {
                setTotalLinks(resultadoTotal.value.datos);
            } else if (resultadoLinks.status === 'fulfilled' && resultadoLinks.value.ok) {
                // Si falla el conteo, al menos mostramos lo que ya hay cargado.
                setTotalLinks(resultadoLinks.value.datos.length);
            }

            setCargando(false);
        },
        [avisar]
    );

    /** Carga la siguiente página y la añade a la lista (scroll infinito). */
    const cargarMas = useCallback(async () => {
        if (cargandoMasRef.current || !hayMas) {
            return;
        }
        cargandoMasRef.current = true;
        setCargandoMas(true);

        const resultado = await linkService.listar({
            skip: links.length,
            limit: TAMANO_PAGINA,
        });

        if (!resultado.ok) {
            avisar(resultado.mensaje ?? 'No se pudieron cargar más links.', 'danger');
            cargandoMasRef.current = false;
            setCargandoMas(false);
            return;
        }

        setLinks((previos) => {
            const ids = new Set(previos.map((link) => link.id));
            return [...previos, ...resultado.datos.filter((link) => !ids.has(link.id))];
        });
        setHayMas(resultado.datos.length === TAMANO_PAGINA);
        cargandoMasRef.current = false;
        setCargandoMas(false);
    }, [avisar, hayMas, links.length]);

    // Recarga al entrar a la pestaña: los datos no quedan obsoletos.
    useIonViewWillEnter(() => {
        cargarDatos();
    });

    // Permite llegar desde Etiquetas con /pages/Home?etiqueta=Nombre
    useEffect(() => {
        const etiqueta = new URLSearchParams(location.search).get('etiqueta');
        if (etiqueta) {
            setCategoriasActivas([etiqueta]);
        }
    }, [location.search]);

    const manejarFiltro = (valor) => {
        if (valor === null) {
            setCategoriasActivas([]);
            return;
        }
        setCategoriasActivas((previas) =>
            previas.includes(valor)
                ? previas.filter((categoria) => categoria !== valor)
                : [...previas, valor]
        );
    };

    const manejarAbrir = async (link) => {
        const abierto = await abrirEnlace(link.url);
        if (!abierto) {
            avisar('No se pudo abrir el enlace.', 'danger');
        }
    };

    const manejarCopiar = async (link) => {
        const copiado = await copiarEnlace(link.url);
        avisar(copiado ? 'Enlace copiado al portapapeles.' : 'No se pudo copiar el enlace.', copiado ? 'success' : 'danger');
    };

    const manejarCompartir = async (link) => {
        const resultado = await compartirEnlace(link.url, link.titulo);
        if (resultado.ok) {
            avisar(resultado.copiado ? 'Enlace copiado para compartir.' : 'Enlace compartido.');
        } else if (!resultado.cancelado) {
            avisar('No se pudo compartir el enlace.', 'danger');
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
                            avisar(resultado.mensaje, 'danger');
                            return;
                        }
                        setLinks((previos) => previos.filter((item) => item.id !== link.id));
                        setTotalLinks((total) => Math.max(0, total - 1));
                        avisar('Enlace eliminado.');
                    },
                },
            ],
        });
    };

    const abrirAcciones = (link) => {
        presentarAcciones({
            header: link.titulo,
            subHeader: link.dominio,
            buttons: [
                { text: 'Abrir', handler: () => manejarAbrir(link) },
                { text: 'Copiar enlace', handler: () => manejarCopiar(link) },
                { text: 'Compartir', handler: () => manejarCompartir(link) },
                { text: 'Editar', handler: () => abrirEditar(link) },
                { text: 'Eliminar', role: 'destructive', handler: () => manejarEliminar(link) },
                { text: 'Cancelar', role: 'cancel' },
            ],
        });
    };

    const abrirCrear = () => {
        setLinkEditar(null);
        setMostrarModal(true);
    };

    const abrirEditar = (link) => {
        setLinkEditar(link);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setLinkEditar(null);
    };

    const texto = textoBusqueda.trim().toLowerCase();
    const tarjetasFiltradas = links.filter((link) => {
        const coincideTexto =
            !texto ||
            [link.titulo, link.url, ...(link.etiquetas ?? [])].some((valor) =>
                String(valor).toLowerCase().includes(texto)
            );
        const coincideCategoria =
            categoriasActivas.length === 0 ||
            categoriasActivas.some((categoria) => (link.etiquetas ?? []).includes(categoria));
        return coincideTexto && coincideCategoria;
    });

    const limpiarFiltros = () => {
        setTextoBusqueda('');
        setCategoriasActivas([]);
        if (location.search) {
            router.push('/pages/Home', 'root', 'replace');
        }
    };

    const hayFiltros = textoBusqueda.trim() !== '' || categoriasActivas.length > 0;
    const opcionesFiltro = etiquetas.map((etiqueta) => etiqueta.nombre);

    // Con filtros o búsqueda activos hay que traer las páginas restantes para no
    // buscar solo dentro de los primeros 50 links.
    useEffect(() => {
        if (!cargando && hayMas && hayFiltros) {
            cargarMas();
        }
    }, [cargando, hayMas, hayFiltros, cargarMas]);

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="header">
                    <div className="header-info">
                        <h1>Mi Baul</h1>
                        <p>{totalLinks} {totalLinks === 1 ? 'link guardado' : 'links guardados'}</p>
                    </div>
                    <button
                        type="button"
                        className="avatar"
                        aria-label="Ir a mi perfil"
                        style={{ backgroundColor: usuario?.avatarColor ?? '#2563eb' }}
                        onClick={() => router.push('/pages/Perfil', 'forward', 'push')}
                    >
                        <span>{usuario?.iniciales ?? '?'}</span>
                    </button>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonRefresher
                    slot="fixed"
                    onIonRefresh={async (evento) => {
                        await cargarDatos(true);
                        evento.detail.complete();
                    }}
                >
                    <IonRefresherContent />
                </IonRefresher>
                <IonSearchbar
                    className="searchBar"
                    type="text"
                    placeholder="Buscar por título, URL o etiqueta..."
                    value={textoBusqueda}
                    onIonInput={(e) => setTextoBusqueda(e.detail.value ?? '')}
                    shape="round"
                    aria-label="Buscar links"
                />
                {opcionesFiltro.length > 0 && (
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
                ) : errorCarga && links.length === 0 ? (
                    <div className="estado-vacio estado-error">
                        <div className="estado-vacio-icono">
                            <IonIcon icon={alertCircleOutline} aria-hidden="true" />
                        </div>
                        <h3>No pudimos cargar tus links</h3>
                        <p>{errorCarga}</p>
                        <IonButton className="estado-vacio-boton" onClick={() => cargarDatos()}>
                            <IonIcon slot="start" icon={refreshOutline} aria-hidden="true" />
                            Reintentar
                        </IonButton>
                    </div>
                ) : tarjetasFiltradas.length === 0 && hayFiltros && hayMas ? (
                    <div className="estado-vacio" role="status" aria-live="polite">
                        <p>Cargando más links para completar la búsqueda...</p>
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
                                <IonButton className="estado-vacio-boton" onClick={abrirCrear}>Guarda tu primer link</IonButton>
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
                                onAbrir={() => manejarAbrir(link)}
                                onAcciones={() => abrirAcciones(link)}
                            />
                        ))}
                    </div>
                )}
                {!cargando && hayMas && (
                    <IonInfiniteScroll
                        disabled={cargandoMas}
                        onIonInfinite={async (evento) => {
                            await cargarMas();
                            evento.target.complete();
                        }}
                    >
                        <IonInfiniteScrollContent loadingText="Cargando más links..." />
                    </IonInfiniteScroll>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton aria-label="Guardar nuevo link" onClick={abrirCrear}>
                        +
                    </IonFabButton>
                </IonFab>
                <LinkFormModal
                    isOpen={mostrarModal}
                    cerrarModal={cerrarModal}
                    etiquetas={etiquetas}
                    link={linkEditar}
                    onGuardado={() => cargarDatos(true)}
                />
            </IonContent>
        </IonPage>
    );
};

export default Home;
