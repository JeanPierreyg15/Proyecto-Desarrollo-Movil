import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider } from '../features/auth/context/AuthContext.jsx';
import AvisosSesion from './AvisosSesion.jsx';
import { useBotonAtras } from './botonAtras.js';
import { RutaComodin, RutaProtegida, RutaPublica } from './ProteccionRutas.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';
import RegisterPage from '../features/auth/pages/RegisterPage.jsx';
import PasswordRecoveryPage from '../features/auth/pages/PasswordRecoveryPage.jsx';
import ChangePasswordPage from '../features/profile/pages/ChangePasswordPage.jsx';
import TabsLayout from './TabsLayout.jsx';

const BotonAtrasNativo = () => {
    useBotonAtras();
    return null;
};

const App = () => (
    <IonApp>
        <AuthProvider>
            <IonReactRouter>
                <AvisosSesion />
                <BotonAtrasNativo />
                <IonRouterOutlet>
                    <Route path="/" element={<RutaPublica><LoginPage /></RutaPublica>} />
                    <Route path="/registro" element={<RutaPublica><RegisterPage /></RutaPublica>} />
                    <Route path="/recuperar" element={<PasswordRecoveryPage />} />
                    <Route path="/cambiar-contrasena" element={<RutaProtegida><ChangePasswordPage /></RutaProtegida>} />
                    {/* Grupo de páginas con tabs: requiere sesión activa */}
                    <Route path="/pages" element={<Navigate to="/pages/Home" replace />} />
                    <Route path="/pages/*" element={<TabsLayout />} />
                    <Route path="*" element={<RutaComodin />} />
                </IonRouterOutlet>
            </IonReactRouter>
        </AuthProvider>
    </IonApp>
);

export default App;
