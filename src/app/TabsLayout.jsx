import { IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/react';
import { homeOutline, pricetagsOutline, personOutline } from 'ionicons/icons';
import { Route } from 'react-router-dom';
import LinkListPage from '../features/links/pages/LinkListPage.jsx';
import TagsPage from '../features/tags/pages/TagsPage.jsx';
import ProfilePage from '../features/profile/pages/ProfilePage.jsx';

const Layout = () => {
    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route path="/pages/Home" element={<LinkListPage />} />
                <Route path="/pages/Etiquetas" element={<TagsPage />} />
                <Route path="/pages/Perfil" element={<ProfilePage />} />
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