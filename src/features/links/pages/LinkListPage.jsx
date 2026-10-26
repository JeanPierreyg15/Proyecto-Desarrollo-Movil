import React, { useEffect, useState } from 'react'
import './LinkListPage.css';
import LinkCard from '../components/LinkCard.jsx';
import LinkFormModal from '../components/LinkFormModal.jsx';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonAvatar,
    IonSearchbar,
    IonFab,
    IonFabButton,
    useIonRouter,
    useIonToast,
} from '@ionic/react';
import FilterButtons from '../components/FilterButtons.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { linkService } from '../services/linkService.js';

const Home = () => {
const { usuario } = useAuth()
const router = useIonRouter()
const [mostrarToast] = useIonToast()
const [links, setLinks] = useState([])
const [mostrarModal,setMostrarModal]=useState(false)
const [textoBusqueda, setTextoBusqueda] = useState('')
const [categoriasActivas, setCategoriasActivas] = useState([]);
useEffect(() => {
    let activo = true;
    linkService.listar()
        .then((datos) => {
            if (activo) {
                setLinks(datos);
            }
        })
        .catch(() => {
            if (activo) {
                mostrarToast({
                    message: 'No se pudieron cargar tus enlaces.',
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
const tarjetasFiltradas = links.filter((obj)=>{
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
                <IonAvatar slot='end' className='avatar' onClick={() => router.push('/pages/Perfil', 'forward', 'push')}>
                    <span>{usuario?.iniciales ?? '?'}</span>
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
        <LinkFormModal isOpen={mostrarModal} cerrarModal={()=>setMostrarModal(false)}/>
        </IonContent>
    </IonPage>
);
};

export default Home;