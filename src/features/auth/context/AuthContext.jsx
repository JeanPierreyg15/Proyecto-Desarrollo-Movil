import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { configurarNoAutorizado } from '../../../app/apiClient.js';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // La sesión se restaura del almacenamiento (token) al arrancar.
    const [usuario, setUsuario] = useState(null);
    const [cargandoSesion, setCargandoSesion] = useState(true);
    const [sinConexion, setSinConexion] = useState(false);
    const [mensajeSesion, setMensajeSesion] = useState(null);

    const aplicarSesion = useCallback((resultado) => {
        setUsuario(resultado.usuario);
        setSinConexion(resultado.sinConexion);
    }, []);

    const reintentarConexion = useCallback(async () => {
        const resultado = await authService.consultarSesion();
        aplicarSesion(resultado);
        return resultado;
    }, [aplicarSesion]);

    useEffect(() => {
        let activo = true;
        authService.restaurarSesion().then((resultado) => {
            if (!activo) {
                return;
            }
            setUsuario(resultado.usuario);
            setSinConexion(resultado.sinConexion);
            setCargandoSesion(false);
        });
        return () => {
            activo = false;
        };
    }, []);

    // Al volver la red se vuelve a preguntar /auth/me sin esperar a que la
    // persona pulse Reintentar.
    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }
        const alRecuperarRed = () => {
            reintentarConexion();
        };
        window.addEventListener('online', alRecuperarRed);
        return () => window.removeEventListener('online', alRecuperarRed);
    }, [reintentarConexion]);

    // Cuando cualquier petición recibe 401, se cierra la sesión en React y la
    // ruta protegida redirige sola al login (con un aviso visible).
    useEffect(() => {
        configurarNoAutorizado(() => {
            setUsuario(null);
            setSinConexion(false);
            setMensajeSesion('Tu sesión expiró, inicia sesión de nuevo');
        });
    }, []);

    const iniciarSesion = useCallback(async (credenciales) => {
        const resultado = await authService.iniciarSesion(credenciales);
        if (resultado.ok) {
            setUsuario(resultado.usuario);
            setSinConexion(false);
            setMensajeSesion(null);
        }
        return resultado;
    }, []);

    const registrar = useCallback(async (datos) => {
        const resultado = await authService.registrar(datos);
        // Si el login automático falló (p. ej. 429), no hay token guardado:
        // no se puede dar la sesión por iniciada.
        if (resultado.ok && !resultado.sesionPendiente) {
            setUsuario(resultado.usuario);
        }
        return resultado;
    }, []);

    const solicitarRecuperacion = useCallback((datos) => authService.solicitarRecuperacion(datos), []);

    const restablecerPassword = useCallback((datos) => authService.restablecerPassword(datos), []);

    const actualizarPerfil = useCallback(async ({ nombre, bio }) => {
        if (!usuario) {
            return { ok: false, mensaje: 'Inicia sesión para editar tu perfil' };
        }
        const resultado = await authService.actualizarPerfil({ nombre, bio });
        if (resultado.ok) {
            setUsuario(resultado.usuario);
        }
        return resultado;
    }, [usuario]);

    const actualizarAvatar = useCallback(async ({ avatarColor }) => {
        if (!usuario) {
            return { ok: false, mensaje: 'Inicia sesión para editar tu perfil' };
        }
        const resultado = await authService.actualizarAvatar({ avatarColor });
        if (resultado.ok) {
            setUsuario(resultado.usuario);
        }
        return resultado;
    }, [usuario]);

    const cambiarPassword = useCallback(async ({ passwordActual, passwordNueva }) => {
        return authService.cambiarPassword({ passwordActual, passwordNueva });
    }, []);

    const eliminarCuenta = useCallback(async (password) => {
        const resultado = await authService.eliminarCuenta(password);
        if (resultado.ok) {
            setUsuario(null);
        }
        return resultado;
    }, []);

    const cerrarSesion = useCallback(async () => {
        await authService.cerrarSesion();
        setUsuario(null);
        setSinConexion(false);
        setMensajeSesion(null);
    }, []);

    const limpiarMensajeSesion = useCallback(() => setMensajeSesion(null), []);

    return (
        <AuthContext.Provider
            value={{
                usuario,
                cargandoSesion,
                sinConexion,
                mensajeSesion,
                limpiarMensajeSesion,
                reintentarConexion,
                iniciarSesion,
                registrar,
                solicitarRecuperacion,
                restablecerPassword,
                actualizarPerfil,
                actualizarAvatar,
                cambiarPassword,
                eliminarCuenta,
                cerrarSesion,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const contexto = useContext(AuthContext);
    if (!contexto) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return contexto;
}
