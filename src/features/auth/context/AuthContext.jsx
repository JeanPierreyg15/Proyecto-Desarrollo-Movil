import { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);

    const iniciarSesion = async (credenciales) => {
        const resultado = await authService.iniciarSesion(credenciales);
        if (resultado.ok) {
            setUsuario(resultado.usuario);
        }
        return resultado;
    };

    const registrar = async (datos) => {
        const resultado = await authService.registrar(datos);
        if (resultado.ok) {
            setUsuario(resultado.usuario);
        }
        return resultado;
    };

    const solicitarRecuperacion = (datos) => authService.solicitarRecuperacion(datos);

    const restablecerPassword = async (datos) => {
        const resultado = await authService.restablecerPassword(datos);
        if (resultado.ok && usuario?.id === resultado.usuario?.id) {
            setUsuario(resultado.usuario);
        }
        return resultado;
    };

    const actualizarPerfil = async ({ nombre, correo }) => {
        if (!usuario) {
            return { ok: false, mensaje: 'Inicia sesión para editar tu perfil' };
        }

        const resultado = await authService.actualizarPerfil({
            id: usuario.id,
            nombre,
            correo,
        });
        if (resultado.ok) {
            setUsuario(resultado.usuario);
        }
        return resultado;
    };

    const cerrarSesion = async () => {
        await authService.cerrarSesion();
        setUsuario(null);
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                iniciarSesion,
                registrar,
                solicitarRecuperacion,
                restablecerPassword,
                actualizarPerfil,
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
