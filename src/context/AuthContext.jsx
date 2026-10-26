import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function obtenerIniciales(nombre = '') {
    const letras = nombre
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((parte) => parte[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    return letras || '?';
}

function crearUsuario({ nombre, correo }) {
    return {
        id: crypto.randomUUID(),
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        iniciales: obtenerIniciales(nombre),
        creadoEn: new Date().toISOString(),
    };
}

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);

    const iniciarSesion = ({ correo, password }) => {
        if (!correo?.trim() || !password) {
            return { ok: false, mensaje: 'Por favor, ingrese sus datos' };
        }
        const nombre = correo.split('@')[0];
        setUsuario(crearUsuario({ nombre, correo }));
        return { ok: true };
    };

    const registrar = ({ nombre, correo, password, confirmar }) => {
        if (!nombre?.trim() || !correo?.trim() || !password || !confirmar) {
            return { ok: false, mensaje: 'Completa todos los campos' };
        }
        if (password.length < 6) {
            return { ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
        }
        if (password !== confirmar) {
            return { ok: false, mensaje: 'Las contraseñas no coinciden' };
        }
        setUsuario(crearUsuario({ nombre, correo }));
        return { ok: true };
    };

    const solicitarRecuperacion = ({ correo }) => {
        if (!correo?.trim()) {
            return { ok: false, mensaje: 'Ingresa tu correo electrónico' };
        }
        return {
            ok: true,
            mensaje: 'Si el correo está registrado, te enviaremos las instrucciones.',
        };
    };

    const actualizarPerfil = ({ nombre, correo }) => {
        if (!nombre?.trim() || !correo?.trim()) {
            return { ok: false, mensaje: 'Nombre y correo son obligatorios' };
        }
        setUsuario((prev) => {
            if (!prev) {
                return crearUsuario({ nombre, correo });
            }
            return {
                ...prev,
                nombre: nombre.trim(),
                correo: correo.trim().toLowerCase(),
                iniciales: obtenerIniciales(nombre),
            };
        });
        return { ok: true };
    };

    const cerrarSesion = () => {
        setUsuario(null);
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                iniciarSesion,
                registrar,
                solicitarRecuperacion,
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
