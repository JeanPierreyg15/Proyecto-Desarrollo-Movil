import React, { useCallback, useEffect, useState } from 'react';
import TagCard from '../components/TagCard.jsx';
import { IonContent, IonGrid, IonHeader, IonPage, IonToolbar, IonRow, IonCol, useIonToast, useIonAlert } from '@ionic/react';
import './TagsPage.css';
import { tagService } from '../services/tagService.js';
import { linkService } from '../../links/services/linkService.js';

const ICONOS_ETIQUETA = ['💻', '🎨', '📚', '🎵', '🎬', '📰', '🍳', '💼', '🛒', '✈️', '⚽', '🔧', '🧪', '🎮'];

function iconoPara(nombre = '') {
    return ICONOS_ETIQUETA[nombre.length % ICONOS_ETIQUETA.length];
}

const TagsPage = () => {
    const [etiquetas, setEtiquetas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarToast] = useIonToast();
    const [presentarAlerta] = useIonAlert();

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
            const lista = resultadoEtiquetas.value.datos.map((etiqueta) => ({
                ...etiqueta,
                cantidad: datosLinks.filter((link) => link.etiquetas.includes(etiqueta.nombre)).length,
                icono: iconoPara(etiqueta.nombre),
            }));
            setEtiquetas(lista);
        } else {
            const mensaje = resultadoEtiquetas.status === 'fulfilled'
                ? resultadoEtiquetas.value.mensaje
                : 'No se pudieron cargar las etiquetas.';
            mostrarToast({
                message: mensaje,
                duration: 2500,
                color: 'danger',
                position: 'bottom',
            });
        }

        setCargando(false);
    }, [mostrarToast]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const manejarNuevaEtiqueta = () => {
        presentarAlerta({
            header: 'Nueva etiqueta',
            message: 'Escribe el nombre de la etiqueta que quieres crear.',
            inputs: [
                { type: 'text', name: 'nombre', placeholder: 'Ej: Trabajo' },
            ],
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Crear',
                    handler: async (datos) => {
                        const nombre = datos?.nombre?.trim();
                        if (!nombre) {
                            mostrarToast({
                                message: 'Escribe un nombre para la etiqueta.',
                                duration: 2000,
                                color: 'danger',
                                position: 'bottom',
                            });
                            return false;
                        }
                        const resultado = await tagService.crear(nombre);
                        if (!resultado.ok) {
                            mostrarToast({
                                message: resultado.mensaje,
                                duration: 2500,
                                color: 'danger',
                                position: 'bottom',
                            });
                            return false;
                        }
                        mostrarToast({
                            message: 'Etiqueta creada con éxito.',
                            duration: 2000,
                            color: 'success',
                            position: 'bottom',
                        });
                        cargarDatos();
                        return true;
                    },
                },
            ],
        });
    };

    const manejarSeleccionEtiqueta = (etiqueta) => {
        presentarAlerta({
            header: etiqueta.titulo,
            message: `Tiene ${etiqueta.cantidad} ${etiqueta.cantidad === 1 ? 'link' : 'links'} asociados. El filtro por etiqueta estará disponible en Inicio.`,
            buttons: ['OK'],
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
                                    <button type="button" className="ghost-card" onClick={manejarNuevaEtiqueta} aria-label="Crear nueva etiqueta">
                                        <div className="ghost-icon">
                                            <span className="plus-icon">+</span>
                                        </div>
                                    </button>
                                </IonCol>
                            </>
                        )}
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default TagsPage;
