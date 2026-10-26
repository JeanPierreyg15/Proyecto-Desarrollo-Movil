import { IonModal, IonButton, IonContent, IonInput } from '@ionic/react';
import FilterButtons from './FilterButtons.jsx';
import { useState } from 'react';
const Modal = ({isOpen, cerrarModal})=>{

    const [url,setUrl] = useState('')
    const [titulo,setTitulo] = useState('')


    const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([])
    const manejarSeleccion = (etiquetaClic) => {
        if (etiquetasSeleccionadas.includes(etiquetaClic)) {
            setEtiquetasSeleccionadas(etiquetasSeleccionadas.filter((e) => e !== etiquetaClic));
        } else {
            setEtiquetasSeleccionadas([...etiquetasSeleccionadas, etiquetaClic]);
        }
    };
    return(
    <IonModal 
    isOpen={isOpen} 
    onDidDismiss={cerrarModal}
    initialBreakpoint={0.75}
    breakpoints={[0, 0.75, 1]}
    >
        <IonContent className="ion-padding">
            <div className="contenedor-modal">
            <div>
            <div className="cabecera">
                <p>Guarda un nuevo enlace</p>
            </div>
                <div className='ion-item'>
                    <p>URL del enlace</p>
                    <IonInput value={url} onIonInput={(e) => setUrl(e.detail.value)} className="input-redondeado" placeholder="https://..." type="url" />
                </div> 
                <div className="ion-item">
                    <p>Título</p>
                    <IonInput value={titulo} onIonInput={(e) => setTitulo(e.detail.value)} className="input-redondeado" placeholder="Ej: Mi portafolio" type="text" />
                </div>
                {url.trim().length > 0 ?(
                <div className="tarjeta-previa">
                    <div className="previa-img">
                    </div>
                    <div className="previa-info">
                        <h4>Tame Impala — The Slow Rush</h4>
                        <p>youtube.com</p>
                    </div>
                </div>
                ):(
                    <div className="previa-vacia">
                        <p>Ingresa una URL para generar la previsualización</p>
                    </div>
                )}
            <div className="grilla-etiquetas">
                <FilterButtons
                opciones={['Dev', 'Diseño', 'Música', 'Noticias', 'Videos', 'Recetas']} 
                activas={etiquetasSeleccionadas} 
                onToggle={manejarSeleccion}/>
            </div>
            </div>
            <div className="footer">
                <div className="modal-footer">
                    <button className="btn-cancelar" onClick={cerrarModal}>
                        Cancelar
                    </button>
                    <button className="btn-guardar" disabled={url.trim() === '' || titulo.trim() === ''}>
                    Guardar
                    </button>
                </div>
        </div>
        </div>
        </IonContent>
    </IonModal>
    )
}

export default Modal