import { IonModal, IonContent, IonInput, useIonToast } from '@ionic/react';
import FilterButtons from './FilterButtons.jsx';
import { useState } from 'react';
import { linkService } from '../services/linkService.js';

/** Extrae el dominio de una URL (mala incluida) para mostrarlo en la previsualización. */
function hostDeUrl(valor = '') {
    const completa = valor.trim().startsWith('http') ? valor.trim() : `https://${valor.trim()}`;
    try {
        return new URL(completa).hostname;
    } catch {
        return valor.trim();
    }
}

const Modal = ({ isOpen, cerrarModal, etiquetas = [], onGuardado }) => {
    const [url, setUrl] = useState('');
    const [titulo, setTitulo] = useState('');
    const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [mostrarToast] = useIonToast();

    const manejarSeleccion = (etiquetaClic) => {
        if (etiquetasSeleccionadas.includes(etiquetaClic)) {
            setEtiquetasSeleccionadas(etiquetasSeleccionadas.filter((e) => e !== etiquetaClic));
        } else {
            setEtiquetasSeleccionadas([...etiquetasSeleccionadas, etiquetaClic]);
        }
    };

    const limpiarYCerrar = () => {
        setUrl('');
        setTitulo('');
        setEtiquetasSeleccionadas([]);
        cerrarModal();
    };

    const manejarGuardar = async () => {
        if (guardando) {
            return;
        }
        setGuardando(true);
        const tagIds = etiquetasSeleccionadas
            .map((nombre) => etiquetas.find((etq) => etq.nombre === nombre)?.id)
            .filter(Boolean);

        const resultado = await linkService.crear({
            titulo: titulo.trim(),
            url: url.trim(),
            tagIds,
        });
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
            message: 'Link guardado con éxito.',
            duration: 2000,
            color: 'success',
            position: 'bottom',
        });
        onGuardado?.(resultado.datos);
        limpiarYCerrar();
    };

    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={limpiarYCerrar}
            initialBreakpoint={0.75}
            breakpoints={[0, 0.75, 1]}
        >
            <IonContent className="ion-padding">
                <div className="contenedor-modal">
                    <div>
                        <div className="cabecera">
                            <p>Guarda un nuevo enlace</p>
                        </div>
                        <div className="ion-item">
                            <p>URL del enlace</p>
                            <IonInput value={url} onIonInput={(e) => setUrl(e.detail.value)} className="input-redondeado" placeholder="https://..." type="url" />
                        </div>
                        <div className="ion-item">
                            <p>Título</p>
                            <IonInput value={titulo} onIonInput={(e) => setTitulo(e.detail.value)} className="input-redondeado" placeholder="Ej: Mi portafolio" type="text" />
                        </div>
                        {url.trim().length > 0 ? (
                            <div className="tarjeta-previa">
                                <div className="previa-img" />
                                <div className="previa-info">
                                    <h4>{titulo.trim() || 'Sin título'}</h4>
                                    <p>{hostDeUrl(url)}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="previa-vacia">
                                <p>Ingresa una URL para generar la previsualización</p>
                            </div>
                        )}
                        <div className="grilla-etiquetas">
                            {etiquetas.length > 0 ? (
                                <FilterButtons
                                    opciones={etiquetas.map((etq) => etq.nombre)}
                                    activas={etiquetasSeleccionadas}
                                    onToggle={manejarSeleccion}
                                />
                            ) : (
                                <p className="sin-etiquetas">Aún no tienes etiquetas. Crea una en la pestaña de Etiquetas.</p>
                            )}
                        </div>
                    </div>
                    <div className="footer">
                        <div className="modal-footer">
                            <button type="button" className="btn-cancelar" onClick={limpiarYCerrar}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-guardar"
                                disabled={guardando || url.trim() === '' || titulo.trim() === ''}
                                onClick={manejarGuardar}
                            >
                                {guardando ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default Modal;
