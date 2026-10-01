import React from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent
} from '@ionic/react';

const Home = () => {
return (
    <IonPage>
        <IonHeader>
        <IonToolbar>
            <IonTitle>Mi App en JS</IonTitle>
        </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
        <h2>¡Todo listo!</h2>
        <p>Proyecto corriendo con React y JavaScript puro desde cero.</p>
        </IonContent>
    </IonPage>
);
};

export default Home;