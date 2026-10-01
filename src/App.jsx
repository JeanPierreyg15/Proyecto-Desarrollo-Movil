// src/App.jsx
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

// Vistas
import Home from './pages/home.jsx';

const App = () => (
<IonApp>
    <IonReactRouter>
        <IonRouterOutlet>
            <Route exact path="/home" component={Home} />
            <Route exact path="/">
                <Navigate replace to="/home" />
            </Route>
        </IonRouterOutlet>
    </IonReactRouter>
</IonApp>
);

export default App;