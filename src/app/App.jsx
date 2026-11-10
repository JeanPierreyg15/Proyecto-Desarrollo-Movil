import React from 'react';
import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider } from '../features/auth/context/AuthContext.jsx';
import { RutaProtegida, RutaPublica } from './ProteccionRutas.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';
import RegisterPage from '../features/auth/pages/RegisterPage.jsx';
import PasswordRecoveryPage from '../features/auth/pages/PasswordRecoveryPage.jsx';
import ChangePasswordPage from '../features/profile/pages/ChangePasswordPage.jsx';
import TabsLayout from './TabsLayout.jsx';

const App = () => (
    <IonApp>
        <AuthProvider>
            <IonReactRouter>
                <IonRouterOutlet>
                    <Route path="/" element={<RutaPublica><LoginPage /></RutaPublica>} />
                    <Route path="/registro" element={<RutaPublica><RegisterPage /></RutaPublica>} />
                    <Route path="/recuperar" element={<RutaPublica><PasswordRecoveryPage /></RutaPublica>} />
                    <Route path="/paginas/recuperar-contrasena" element={<RutaPublica><PasswordRecoveryPage /></RutaPublica>} />
                    <Route path="/cambiar-contrasena" element={<RutaProtegida><ChangePasswordPage /></RutaProtegida>} />
                    {/* Grupo de páginas con tabs: requiere sesión activa */}
                    <Route path="/pages/*" element={<RutaProtegida><TabsLayout /></RutaProtegida>} />
                </IonRouterOutlet>
            </IonReactRouter>
        </AuthProvider>
    </IonApp>
);

export default App;
