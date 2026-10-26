import React from 'react';
import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider } from './context/AuthContext.jsx';
import Login from './pages/Login/login.jsx';
import Registro from './pages/Registro/registro.jsx';
import Recuperar from './pages/Recuperar/recuperar.jsx';
import Layout from './TabsLayout.jsx';

const App = () => (
    <IonApp>
        <AuthProvider>
            <IonReactRouter>
                <IonRouterOutlet>
                    <Route path="/" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />
                    <Route path="/recuperar" element={<Recuperar />} />
                    <Route path="/pages/*" element={<Layout />} />
                </IonRouterOutlet>
            </IonReactRouter>
        </AuthProvider>
    </IonApp>
);

export default App;
