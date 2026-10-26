import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const correoValido = (correo = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());

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

function sinPassword(usuario) {
    if (!usuario) {
        return null;
    }
    const { password, ...publico } = usuario;
    return publico;
}

function crearUsuario({ nombre, correo, password }) {
    return {
        id: crypto.randomUUID(),
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        password,
        iniciales: obtenerIniciales(nombre),
        creadoEn: new Date().toISOString(),
    };
}

export function AuthProvider({ children }) {
    const [usuarios, setUsuarios] = useState([]);
    const [usuario, setUsuario] = useState(null);

    const persistir = (lista, sesion) => {
        setUsuarios(lista);
        setUsuario(sesion);
    };

    const iniciarSesion = ({ correo, password }) => {
        if (!correo?.trim() || !password) {
            return { ok: false, mensaje: 'Por favor, ingrese sus datos' };
        }
        const hallado = usuarios.find((item) => item.correo === correo.trim().toLowerCase());
        if (!hallado || hallado.password !== password) {
            return { ok: false, mensaje: 'Correo o contraseña incorrectos' };
        }
        const sesion = sinPassword(hallado);
        setUsuario(sesion);
        return { ok: true };
    };

    const registrar = ({ nombre, correo, password, confirmar }) => {
        if (!nombre?.trim() || !correo?.trim() || !password || !confirmar) {
            return { ok: false, mensaje: 'Completa todos los campos' };
        }
        if (!correoValido(correo)) {
            return { ok: false, mensaje: 'Ingresa un correo válido' };
        }
        if (password.length < 6) {
            return { ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
        }
        if (password !== confirmar) {
            return { ok: false, mensaje: 'Las contraseñas no coinciden' };
        }
        const correoNormalizado = correo.trim().toLowerCase();
        if (usuarios.some((item) => item.correo === correoNormalizado)) {
            return { ok: false, mensaje: 'Ese correo ya tiene una cuenta' };
        }
        const nuevo = crearUsuario({ nombre, correo, password });
        persistir([...usuarios, nuevo], sinPassword(nuevo));
        return { ok: true };
    };

    const solicitarRecuperacion = ({ correo }) => {
        if (!correo?.trim()) {
            return { ok: false, mensaje: 'Ingresa tu correo electrónico' };
        }
        if (!correoValido(correo)) {
            return { ok: false, mensaje: 'Ingresa un correo válido' };
        }
        const existe = usuarios.some((item) => item.correo === correo.trim().toLowerCase());
        if (!existe) {
            return { ok: false, mensaje: 'No hay una cuenta con ese correo' };
        }
        return { ok: true };
    };

    const restablecerPassword = ({ correo, password, confirmar }) => {
        if (!password || !confirmar) {
            return { ok: false, mensaje: 'Completa la nueva contraseña' };
        }
        if (password.length < 6) {
            return { ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
        }
        if (password !== confirmar) {
            return { ok: false, mensaje: 'Las contraseñas no coinciden' };
        }
        const correoNormalizado = correo.trim().toLowerCase();
        const indice = usuarios.findIndex((item) => item.correo === correoNormalizado);
        if (indice === -1) {
            return { ok: false, mensaje: 'No hay una cuenta con ese correo' };
        }
        const actualizado = { ...usuarios[indice], password };
        const lista = usuarios.map((item, i) => (i === indice ? actualizado : item));
        const sesionActiva = usuario?.id === actualizado.id ? sinPassword(actualizado) : usuario;
        persistir(lista, sesionActiva);
        return { ok: true };
    };

    const actualizarPerfil = ({ nombre, correo }) => {
        if (!nombre?.trim() || !correo?.trim()) {
            return { ok: false, mensaje: 'Nombre y correo son obligatorios' };
        }
        if (!correoValido(correo)) {
            return { ok: false, mensaje: 'Ingresa un correo válido' };
        }
        if (!usuario) {
            return { ok: false, mensaje: 'Inicia sesión para editar tu perfil' };
        }
        const correoNormalizado = correo.trim().toLowerCase();
        const ocupado = usuarios.some((item) => item.correo === correoNormalizado && item.id !== usuario.id);
        if (ocupado) {
            return { ok: false, mensaje: 'Ese correo ya está en uso' };
        }
        const lista = usuarios.map((item) => {
            if (item.id !== usuario.id) {
                return item;
            }
            return {
                ...item,
                nombre: nombre.trim(),
                correo: correoNormalizado,
                iniciales: obtenerIniciales(nombre),
            };
        });
        const actualizado = lista.find((item) => item.id === usuario.id);
        persistir(lista, sinPassword(actualizado));
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
