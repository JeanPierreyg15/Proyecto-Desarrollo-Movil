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
    IonSearchbar,
    IonFab,
    IonFabButton
} from '@ionic/react';

const Home = () => {
const Lista = [{id:1,titulo:'React',url:'react.dev',imagen:'https://ionicframework.com/docs/img/demos/thumbnail.svg',tiempo:'2h',etiquetas:['Diseño' , 'Dev']},
                {id:2,titulo:'React',url:'react.dev',imagen:'https://ionicframework.com/docs/img/demos/thumbnail.svg',tiempo:'2h',etiquetas:['Diseño' , 'Dev']},
                {id:3,titulo:'React',url:'react.dev',imagen:'https://ionicframework.com/docs/img/demos/thumbnail.svg',tiempo:'2h',etiquetas:['Diseño' , 'Dev']},
            {id:4,titulo:'React',url:'react.dev',imagen:'https://ionicframework.com/docs/img/demos/thumbnail.svg',tiempo:'2h',etiquetas:['Diseño' , 'Dev']}]

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
        <div className='list-card'>
            {Lista.map((obj)=> <LinkCard key={obj.id} titulo={obj.titulo} url={obj.url} imagen={obj.imagen} tiempo={obj.tiempo} etiquetas={obj.etiquetas}/>)}
        </div>
        <IonFab vertical="bottom" horizontal="end" slot='fixed'>
            <IonFabButton>
                +
            </IonFabButton>
        </IonFab>
        </IonContent>
    </IonPage>
);
};

export default Home;