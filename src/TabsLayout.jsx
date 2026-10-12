import { IonRouterOutlet,IonTabs,IonTabBar,IonTabButton ,IonLabel,IonIcon } from "@ionic/react";
import { homeOutline, pricetagsOutline, personOutline } from 'ionicons/icons';
import { Route } from "react-router-dom";
import Home from "./pages/Home/home";
import Etiquetas from "./pages/Etiquetas/etiquetas";

const Layout = () =>{
    return(
        <IonTabs>
            <IonRouterOutlet>
                <Route path="/pages/Home" element={<Home/>}/>
                <Route path="/pages/Etiquetas" element={<Etiquetas/>} />
            </IonRouterOutlet>
                <IonTabBar slot='bottom'>
                    <IonTabButton tab="home" href="/pages/Home">
                        <IonIcon icon={homeOutline}/>
                        <IonLabel>
                            Inicio
                        </IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="etiquetas" href="/pages/Etiquetas">
                        <IonIcon icon={pricetagsOutline} />    
                        <IonLabel>
                            Etiquetas
                        </IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="perfil" href="/pages/Home">
                        <IonIcon icon={personOutline}/>
                        <IonLabel>
                            Perfil
                        </IonLabel>
                    </IonTabButton>
                </IonTabBar>
        </IonTabs>
    )
}

export default Layout;