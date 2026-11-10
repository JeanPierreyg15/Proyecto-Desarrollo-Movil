import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService, mapearUsuario } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // La sesión se restaura del almacenamiento local (token) al arrancar.
    const [usuario, setUsuario] = useState(null);
    const [cargandoSesion, setCargandoSesion] = useState(true);

    useEffect(() => {
        let activo = true;
        authService.restaurarSesion().then((usuarioGuardado) => {
            if (!activo) {
                return;
            }
            setUsuario(usuarioGuardado);
            setCargandoSesion(false);
        });
        return () => {
            activo = false;
        };
    }, []);

    const iniciarSesion = useCallback(async (credenciales) => {
        const resultado = await authService.iniciarSesion(credenciales);
        if (resultado.ok) {
            setUsuario(resultado.usuario);
        }
        return resultado;
    }, []);

    const registrar = useCallback(async (datos) => {
        const resultado = await authService.registrar(datos);
        if (resultado.ok) {
            setUsuario(resultado.usuario);
        }
        return resultado;
    }, []);

    const solicitarRecuperacion = useCallback((datos) => authService.solicitarRecuperacion(datos), []);

    const restablecerPassword = useCallback((datos) => authService.restablecerPassword(datos), []);

    const actualizarPerfil = useCallback(async ({ nombre, correo }) => {
        if (!usuario) {
            return { ok: false, mensaje: 'Inicia sesión para editar tu perfil' };
        }
        const resultado = await authService.actualizarPerfil({ id: usuario.id, nombre, correo });
        if (resultado.ok) {
            const actualizado = { ...usuario, nombre: nombre ?? usuario.nombre, correo: correo ?? usuario.correo };
            // El backend aún no persiste cambios de perfil; se reflejan en la sesión actual.
            setUsuario(actualizado);
        }
        return resultado;
    }, [usuario]);

    const actualizarAvatar = useCallback(async ({ avatarColor }) => {
        if (!usuario) {
            return { ok: false, mensaje: 'Inicia sesión para editar tu perfil' };
        }
        const resultado = await authService.actualizarAvatar({ id: usuario.id, avatarColor });
        if (resultado.ok) {
            setUsuario({ ...usuario, avatarColor });
        }
        return resultado;
    }, [usuario]);

    const cerrarSesion = useCallback(async () => {
        await authService.cerrarSesion();
        setUsuario(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                usuario,
                cargandoSesion,
                iniciarSesion,
                registrar,
                solicitarRecuperacion,
                restablecerPassword,
                actualizarPerfil,
                actualizarAvatar,
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

export { mapearUsuario };
