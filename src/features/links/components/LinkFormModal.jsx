import React, { useEffect, useState } from 'react';
import { IonModal, IonContent, IonInput, useIonToast } from '@ionic/react';
import FilterButtons from './FilterButtons.jsx';
import { linkService } from '../services/linkService.js';
import { LONGITUD_MAXIMA_URL, dominioDeUrl, faviconDeUrl, normalizarUrl } from '../../../app/validaciones.js';

const Modal = ({ isOpen, cerrarModal, etiquetas = [], onGuardado, link = null }) => {
    const [url, setUrl] = useState('');
    const [titulo, setTitulo] = useState('');
    const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [mostrarToast] = useIonToast();

    const editando = Boolean(link);

    // Al abrir el modal se cargan los datos del link (edición) o se limpia (creación).
    useEffect(() => {
        if (!isOpen) {
            return;
        }
        if (link) {
            setUrl(link.url ?? '');
            setTitulo(link.titulo ?? '');
            // Se guarda por id: los nombres pueden cambiar y las etiquetas
            // pueden no haber cargado (petición fallida).
            setEtiquetasSeleccionadas(link.tagIds ?? []);
        } else {
            setUrl('');
            setTitulo('');
            setEtiquetasSeleccionadas([]);
        }
        setGuardando(false);
    }, [isOpen, link]);

    const manejarSeleccion = (etiquetaClic) => {
        if (etiquetaClic === null) {
            setEtiquetasSeleccionadas([]);
            return;
        }
        setEtiquetasSeleccionadas((previas) =>
            previas.includes(etiquetaClic)
                ? previas.filter((id) => id !== etiquetaClic)
                : [...previas, etiquetaClic]
        );
    };

    const cerrar = () => {
        cerrarModal?.();
    };

    const manejarGuardar = async () => {
        if (guardando) {
            return;
        }
        const etiquetasDisponibles = etiquetas.length > 0;
        // Si la lista de etiquetas no cargó, conservamos las que ya tenía el
        // link en vez de enviar [] y borrarlas en silencio.
        const tagIds = etiquetasDisponibles
            ? etiquetasSeleccionadas
            : editando
              ? (link.tagIds ?? [])
              : [];

        setGuardando(true);
        const datos = { titulo, url, tagIds };
        const resultado = editando
            ? await linkService.actualizar(link.id, datos)
            : await linkService.crear(datos);
        setGuardando(false);

        if (!resultado.ok) {
            mostrarToast({
                message: resultado.mensaje,
                duration: 2500,
                color: 'danger',
                position: 'bottom',
            });
            return;
        }

        mostrarToast({
            message: editando ? 'Enlace actualizado.' : 'Link guardado con éxito.',
            duration: 2000,
            color: 'success',
            position: 'bottom',
        });
        onGuardado?.(resultado.datos);
        cerrar();
    };

    const urlNormalizada = normalizarUrl(url);
    const host = urlNormalizada ? dominioDeUrl(urlNormalizada) : '';
    const favicon = urlNormalizada ? faviconDeUrl(urlNormalizada) : null;

    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={cerrar}
            initialBreakpoint={0.85}
            breakpoints={[0, 0.85, 1]}
        >
            <IonContent className="ion-padding">
                <div className="contenedor-modal">
                    <div>
                        <div className="cabecera">
                            <p>{editando ? 'Edita el enlace' : 'Guarda un nuevo enlace'}</p>
                        </div>
                        <div className="ion-item">
                            <p>URL del enlace</p>
                            <IonInput
                                value={url}
                                onIonInput={(e) => setUrl(e.detail.value ?? '')}
                                className="input-redondeado"
                                placeholder="https://..."
                                type="url"
                                inputmode="url"
                                autocomplete="url"
                                maxlength={LONGITUD_MAXIMA_URL}
                            />
                        </div>
                        <div className="ion-item">
                            <p>Título</p>
                            <IonInput
                                value={titulo}
                                onIonInput={(e) => setTitulo(e.detail.value ?? '')}
                                className="input-redondeado"
                                placeholder="Ej: Mi portafolio"
                                type="text"
                                maxlength={200}
                            />
                        </div>
                        {urlNormalizada ? (
                            <div className="tarjeta-previa">
                                {favicon ? (
                                    <img
                                        className="previa-img"
                                        src={favicon}
                                        alt=""
                                        width="60"
                                        height="60"
                                        onError={(evento) => {
                                            evento.currentTarget.style.visibility = 'hidden';
                                        }}
                                    />
                                ) : (
                                    <div className="previa-img" aria-hidden="true" />
                                )}
                                <div className="previa-info">
                                    <h4>{titulo.trim() || 'Sin título'}</h4>
                                    <p>{host}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="previa-vacia">
                                <p>Ingresa una URL válida para generar la previsualización</p>
                            </div>
                        )}
                        <div className="grilla-etiquetas">
                            {etiquetas.length > 0 ? (
                                <FilterButtons
                                    opciones={etiquetas.map((etq) => ({ valor: etq.id, texto: etq.nombre }))}
                                    activas={etiquetasSeleccionadas}
                                    onToggle={manejarSeleccion}
                                    mostrarTodos={false}
                                />
                            ) : (
                                <p className="sin-etiquetas">Aún no tienes etiquetas. Crea una en la pestaña de Etiquetas.</p>
                            )}
                        </div>
                    </div>
                    <div className="footer">
                        <div className="modal-footer">
                            <button type="button" className="btn-cancelar" onClick={cerrar}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-guardar"
                                disabled={guardando || url.trim() === '' || titulo.trim() === ''}
                                onClick={manejarGuardar}
                            >
                                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default Modal;
