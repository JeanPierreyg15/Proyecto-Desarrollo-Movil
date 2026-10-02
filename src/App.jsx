// src/App.jsx
import React from 'react';
import Login from './pages/Login/login.jsx';
import { Route, Navigate } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

// Vistas
import Home from './pages/Home/home.jsx';

const App = () => (
<IonApp>
    <IonReactRouter>
        <IonRouterOutlet>
            <Route path="/home" element={<Home/>} />
            <Route path="/login" element={<Login/>}/>
            <Route path = '/' element={<Navigate replace to="/login" />}/>
        </IonRouterOutlet>
    </IonReactRouter>
</IonApp>
);

export default App;