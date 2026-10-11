// src/App.jsx
import React from 'react';
import Login from './pages/Login/login.jsx';
import { Route, Navigate } from 'react-router-dom';
import { IonApp, IonRouterOutlet} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

// Vistas
import Layout from './TabsLayout.jsx';

const App = () => (
<IonApp>
    <IonReactRouter>
                <IonRouterOutlet>
                    <Route path="/" element={<Login/>}/>
                    <Route path="/pages/*" element={<Layout/>}/>
                </IonRouterOutlet>
    </IonReactRouter>
</IonApp>
);

export default App;