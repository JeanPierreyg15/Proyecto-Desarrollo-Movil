// Botón atrás de Android.
// En las pestañas secundarias vuelve a Inicio; en Inicio minimiza la app en
// lugar de cerrarla de golpe; fuera de las pestañas respeta el historial.

import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { useLocation, useNavigate } from 'react-router-dom';
import { esNativo } from './enlaces.js';

export const RUTA_INICIO = '/pages/Home';

export function useBotonAtras() {
    const location = useLocation();
    const navigate = useNavigate();
    const rutaRef = useRef(location.pathname);
    rutaRef.current = location.pathname;

    useEffect(() => {
        if (!esNativo()) {
            return undefined;
        }

        let activo = true;
        let escucha = null;

        App.addListener('backButton', ({ canGoBack }) => {
            const ruta = rutaRef.current;

            if (ruta === RUTA_INICIO) {
                App.minimizeApp();
                return;
            }
            if (ruta.startsWith('/pages/')) {
                navigate(RUTA_INICIO, { replace: true });
                return;
            }
            if (canGoBack) {
                navigate(-1);
                return;
            }
            navigate('/', { replace: true });
        }).then((handle) => {
            if (activo) {
                escucha = handle;
            } else {
                handle.remove();
            }
        });

        return () => {
            activo = false;
            escucha?.remove();
        };
    }, [navigate]);
}
