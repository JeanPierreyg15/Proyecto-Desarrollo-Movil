import React from "react"
import TagCard from './tagCard.jsx'
import { IonContent, IonGrid, IonHeader, IonPage, IonToolbar,IonRow,IonCol } from "@ionic/react"
import './etiquetas.css'
const Etiquetas = () =>{
    const datosEtiquetas = [
    { id: 1, titulo: 'Dev', cantidad: 3, icono: '💻' }, 
    { id: 2, titulo: 'Diseño', cantidad: 2, icono: '🎨' }
]
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

export default Etiquetas