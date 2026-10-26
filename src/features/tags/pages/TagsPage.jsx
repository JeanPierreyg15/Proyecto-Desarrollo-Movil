import React, { useEffect, useState } from 'react';
import TagCard from '../components/TagCard.jsx';
import { IonContent, IonGrid, IonHeader, IonPage, IonToolbar, IonRow, IonCol, useIonToast } from '@ionic/react';
import './TagsPage.css';
import { tagService } from '../services/tagService.js';

const TagsPage = () => {
    const [datosEtiquetas, setDatosEtiquetas] = useState([]);
    const [mostrarToast] = useIonToast();

    useEffect(() => {
        let activo = true;
        tagService.listar()
            .then((datos) => {
                if (activo) {
                    setDatosEtiquetas(datos);
                }
            })
            .catch(() => {
                if (activo) {
                    mostrarToast({
                        message: 'No se pudieron cargar las etiquetas.',
                        duration: 2500,
                        color: 'danger',
                        position: 'bottom',
                    });
                }
            });

        return () => {
            activo = false;
        };
    }, [mostrarToast]);

    return(
    <IonPage>
        <IonHeader className="ion-no-border">
            <IonToolbar >
                <div className="header-info">
                <h1> Etiquetas </h1>
                <p> 8 categorias </p>
                </div>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonGrid>
                <IonRow>
                        {datosEtiquetas.map((obj)=>{
                            return(
                            <IonCol size="6" key={obj.id}>
                            <TagCard titulo={obj.titulo} cantidad={obj.cantidad} imagen={obj.icono} onClick={() => alert(`Mostrar lista filtrada de: ${obj.titulo}`)}/>
                            </IonCol>
                            )
                        })}
                        <IonCol size='6'>
                            <div className="ghost-card" onClick={() => alert('Abrir modal para crear nueva etiqueta')}>
                                <div className="ghost-icon">
                                    <span className="plus-icon">+</span>
                                </div>
                            </div>
                        </IonCol>
                </IonRow>
            </IonGrid>
        </IonContent>
    </IonPage>
    )
}

export default TagsPage