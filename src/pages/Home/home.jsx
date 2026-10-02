import React from 'react';
import './home.css';
import LinkCard from './cards';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonAvatar,
    IonInput,
    IonSearchbar
} from '@ionic/react';

const Home = () => {
return (
    <IonPage>
        <IonHeader className='ion-no-border'>
            <IonToolbar className="header" > 
                <div className='header-info'>
                    <h1>Mi Baul</h1>
                    <p>8 links guardados</p>
                </div>
                <IonAvatar slot='end' className='avatar'>
                    <span>JD</span>
                </IonAvatar>
            </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">    
            <IonSearchbar className='searchBar' type='text' placeholder='Buscar en tu baúl...'/>
        <div className='categories'>
            <button className='active'> Todos </button>
            <button> Dev </button>
            <button> Diseño </button>
        </div>
        <LinkCard titulo='React' url='react.dev' imagen='https://ionicframework.com/docs/img/demos/thumbnail.svg' tiempo = '2h'/>
        </IonContent>
    </IonPage>
);
};

export default Home;