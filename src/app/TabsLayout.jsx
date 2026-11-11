import React from 'react';
import {
    IonContent,
    IonIcon,
    IonLabel,
    IonPage,
    IonRouterOutlet,
    IonSpinner,
    IonTabBar,
    IonTabButton,
    IonTabs,
} from '@ionic/react';
import { homeOutline, pricetagsOutline, personOutline } from 'ionicons/icons';
import { Navigate, Route } from 'react-router-dom';
import LinkListPage from '../features/links/pages/LinkListPage.jsx';
import TagsPage from '../features/tags/pages/TagsPage.jsx';
import ProfilePage from '../features/profile/pages/ProfilePage.jsx';
import { useAuth } from '../features/auth/context/AuthContext.jsx';

const Layout = () => {
    const { usuario, cargandoSesion } = useAuth();

    if (cargandoSesion) {
        return (
            <IonPage>
                <IonContent className="ion-justify-content-center ion-align-items-center">
                    <IonSpinner name="crescent" aria-label="Cargando" />
                </IonContent>
            </IonPage>
        );
    }

    if (!usuario) {
        return <Navigate to="/" replace />;
    }

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route index element={<Navigate to="Home" replace />} />
                <Route path="Home" element={<LinkListPage />} />
                <Route path="Etiquetas" element={<TagsPage />} />
                <Route path="Perfil" element={<ProfilePage />} />
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
                <IonTabButton tab="home" href="/pages/Home">
                    <IonIcon icon={homeOutline} />
                    <IonLabel>Inicio</IonLabel>
                </IonTabButton>
                <IonTabButton tab="etiquetas" href="/pages/Etiquetas">
                    <IonIcon icon={pricetagsOutline} />
                    <IonLabel>Etiquetas</IonLabel>
                </IonTabButton>
                <IonTabButton tab="perfil" href="/pages/Perfil">
                    <IonIcon icon={personOutline} />
                    <IonLabel>Perfil</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default Layout;