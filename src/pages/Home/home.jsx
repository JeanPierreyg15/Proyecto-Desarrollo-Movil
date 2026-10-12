import React, { useState } from 'react'
import './home.css';
import LinkCard from './cards';
import Modal from './modal';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonAvatar,
    IonSearchbar,
    IonFab,
    IonFabButton,
} from '@ionic/react';
import FilterButtons from './filterButtons';

const Home = () => {
const [mostrarModal,setMostrarModal]=useState(false)
const [textoBusqueda, setTextoBusqueda] = useState('')
const [categoriasActivas, setCategoriasActivas] = useState([]);
const Lista = [{id:1,titulo:'Java',url:'react.dev',imagen:'https://ionicframework.com/docs/img/demos/thumbnail.svg',tiempo:'2h',etiquetas:['Dev']},
                {id:2,titulo:'React',url:'react.dev',imagen:'https://ionicframework.com/docs/img/demos/thumbnail.svg',tiempo:'2h',etiquetas:['Diseño' , 'Dev']},
                {id:3,titulo:'React',url:'react.dev',imagen:'https://ionicframework.com/docs/img/demos/thumbnail.svg',tiempo:'2h',etiquetas:['Diseño' , 'Dev']},
            {id:4,titulo:'React',url:'react.dev',imagen:'https://ionicframework.com/docs/img/demos/thumbnail.svg',tiempo:'2h',etiquetas:['Diseño' , 'Dev']}]
const manejarFiltro = (categoriaClic)=>{
    if(categoriaClic==='Todos'){
        setCategoriasActivas ([])
        return
    }

    if(categoriasActivas.includes(categoriaClic)){
        setCategoriasActivas(categoriasActivas.filter((c) => c !== categoriaClic))
    }else{
        setCategoriasActivas([...categoriasActivas, categoriaClic]);
    }

}
const tarjetasFiltradas = Lista.filter((obj)=>{
    const coincideTexto = obj.titulo.toLowerCase().includes(textoBusqueda.toLowerCase())
    const coincideCategoria = categoriasActivas.length === 0 || categoriasActivas.some((cat) => obj.etiquetas.includes(cat))
    return coincideTexto && coincideCategoria
})
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
            <IonSearchbar className='searchBar' type='text' placeholder='Buscar en tu baúl...' value={textoBusqueda} onIonInput={(e) => setTextoBusqueda(e.detail.value)} shape='round'/>
            <FilterButtons
            opciones = {['Todos','Dev','Diseño']}
            activas={categoriasActivas} 
            onToggle={manejarFiltro} 
            />
        <div className='list-card'>
            {tarjetasFiltradas.map((obj)=> <LinkCard key={obj.id} titulo={obj.titulo} url={obj.url} imagen={obj.imagen} tiempo={obj.tiempo} etiquetas={obj.etiquetas}/>)}
        </div>  
        <IonFab vertical="bottom" horizontal="end" slot='fixed'>
            <IonFabButton onClick={()=> setMostrarModal(true)}>
                +
            </IonFabButton>
        </IonFab>
        <Modal isOpen={mostrarModal} cerrarModal={()=>setMostrarModal(false)}/>
        </IonContent>
    </IonPage>
);
};

export default Home;