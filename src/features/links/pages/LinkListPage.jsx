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
    IonButton,
    IonIcon,
    useIonRouter,
    useIonToast,
} from '@ionic/react';
import { linkOutline, searchOutline } from 'ionicons/icons';
import FilterButtons from '../components/FilterButtons.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { linkService } from '../services/linkService.js';

const Home = () => {
const { usuario } = useAuth()
const router = useIonRouter()
const [mostrarToast] = useIonToast()
const [links, setLinks] = useState([])
const [cargando, setCargando] = useState(true)
const [mostrarModal,setMostrarModal]=useState(false)
const [textoBusqueda, setTextoBusqueda] = useState('')
const [categoriasActivas, setCategoriasActivas] = useState([]);
useEffect(() => {
    let activo = true;
    setCargando(true);
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
        })
        .finally(() => {
            if (activo) {
                setCargando(false);
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
const limpiarFiltros = () => {
    setTextoBusqueda('')
    setCategoriasActivas([])
}
const hayFiltros = textoBusqueda.trim() !== '' || categoriasActivas.length > 0
return (    
    <IonPage>
        <IonHeader className='ion-no-border'>
            <IonToolbar className="header" > 
                <div className='header-info'>
                    <h1>Mi Baul</h1>
                    <p>8 links guardados</p>
                </div>
                <IonAvatar slot='end' className='avatar' style={{ backgroundColor: usuario?.avatarColor ?? '#2563eb' }} onClick={() => router.push('/pages/Perfil', 'forward', 'push')}>
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
        {cargando ? (
            <div className='list-card'>
                {[0, 1, 2].map((i) => (
                    <div className='link-skeleton' key={i}>
                        <div className='skeleton link-skeleton-img' />
                        <div className='link-skeleton-cuerpo'>
                            <div className='skeleton link-skeleton-linea link-skeleton-linea--titulo' />
                            <div className='skeleton link-skeleton-linea' />
                            <div className='skeleton link-skeleton-linea link-skeleton-linea--corta' />
                        </div>
                    </div>
                ))}
            </div>
        ) : tarjetasFiltradas.length === 0 ? (
            <div className='estado-vacio'>
                <div className='estado-vacio-icono'>
                    <IonIcon icon={hayFiltros ? searchOutline : linkOutline} aria-hidden="true" />
                </div>
                {hayFiltros ? (
                    <>
                        <h3>Sin resultados</h3>
                        <p>No encontramos links que coincidan con tu búsqueda o filtros.</p>
                        <IonButton className='estado-vacio-boton' onClick={limpiarFiltros}>Limpiar filtros</IonButton>
                    </>
                ) : (
                    <>
                        <h3>Tu baúl está vacío</h3>
                        <p>Empieza a guardar tus links favoritos para tenerlos siempre a mano.</p>
                        <IonButton className='estado-vacio-boton' onClick={() => setMostrarModal(true)}>Guarda tu primer link</IonButton>
                    </>
                )}
            </div>
        ) : (
            <div className='list-card'>
                {tarjetasFiltradas.map((obj)=> <LinkCard key={obj.id} titulo={obj.titulo} url={obj.url} imagen={obj.imagen} tiempo={obj.tiempo} etiquetas={obj.etiquetas}/>)}
            </div>
        )}
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