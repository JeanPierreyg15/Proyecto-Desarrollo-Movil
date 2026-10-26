import React from 'react';
import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider } from '../features/auth/context/AuthContext.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';
import RegisterPage from '../features/auth/pages/RegisterPage.jsx';
import PasswordRecoveryPage from '../features/auth/pages/PasswordRecoveryPage.jsx';
import Layout from './TabsLayout.jsx';

const App = () => (
    <IonApp>
        <AuthProvider>
            <IonReactRouter>
                <IonRouterOutlet>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/registro" element={<RegisterPage />} />
                    <Route path="/recuperar" element={<PasswordRecoveryPage />} />
                    <Route path="/pages/*" element={<Layout />} />
                </IonRouterOutlet>
            </IonReactRouter>
        </AuthProvider>
    </IonApp>
);

export default App;
