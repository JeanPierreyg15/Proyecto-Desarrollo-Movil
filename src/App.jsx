// src/App.jsx
import React from 'react';
import Login from './pages/Login/login.jsx';
import { Route, Navigate } from 'react-router-dom';
import { IonApp, IonRouterOutlet,IonTabs,IonTabBar,IonTabButton ,IonLabel,IonIcon} from '@ionic/react';
import { homeOutline, pricetagsOutline, personOutline } from 'ionicons/icons';
import { IonReactRouter } from '@ionic/react-router';

// Vistas
import Home from './pages/Home/home.jsx';

const App = () => (
<IonApp>
    <IonReactRouter>
            <IonTabs>
                <IonRouterOutlet>
                    <Route path="/home" element={<Home/>}/>
                    
                </IonRouterOutlet>
                <IonTabBar slot='bottom'>
                    <IonTabButton tab="home" href="/home">
                        <IonIcon icon={homeOutline}/>
                        <IonLabel>
                            Inicio
                        </IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="etiquetas" href="/home">
                        <IonIcon icon={pricetagsOutline} />    
                        <IonLabel>
                            Etiquetas
                        </IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="perfil" href="/home">
                        <IonIcon icon={personOutline}/>
                        <IonLabel>
                            Perfil
                        </IonLabel>
                    </IonTabButton>
                </IonTabBar>
            </IonTabs>
    </IonReactRouter>
</IonApp>
);

export default App;