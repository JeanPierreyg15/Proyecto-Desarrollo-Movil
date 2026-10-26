const correoValido = (correo = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());

let usuarios = [];

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

function usuarioPublico(usuario) {
    if (!usuario) {
        return null;
    }

    const { password, ...datosPublicos } = usuario;
    return datosPublicos;
}

export const authService = {
    async iniciarSesion({ correo, password }) {
        if (!correo?.trim() || !password) {
            return { ok: false, mensaje: 'Por favor, ingrese sus datos' };
        }

        const usuario = usuarios.find((item) => item.correo === correo.trim().toLowerCase());
        if (!usuario || usuario.password !== password) {
            return { ok: false, mensaje: 'Correo o contraseña incorrectos' };
        }

        return { ok: true, usuario: usuarioPublico(usuario) };
    },

    async registrar({ nombre, correo, password, confirmar }) {
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

        const usuario = crearUsuario({ nombre, correo, password });
        usuarios = [...usuarios, usuario];
        return { ok: true, usuario: usuarioPublico(usuario) };
    },

    async solicitarRecuperacion({ correo }) {
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
    },

    async restablecerPassword({ correo, password, confirmar }) {
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
        const usuario = usuarios.find((item) => item.correo === correoNormalizado);
        if (!usuario) {
            return { ok: false, mensaje: 'No hay una cuenta con ese correo' };
        }

        const actualizado = { ...usuario, password };
        usuarios = usuarios.map((item) => (item.id === actualizado.id ? actualizado : item));
        return { ok: true, usuario: usuarioPublico(actualizado) };
    },

    async actualizarPerfil({ id, nombre, correo }) {
        if (!nombre?.trim() || !correo?.trim()) {
            return { ok: false, mensaje: 'Nombre y correo son obligatorios' };
        }
        if (!correoValido(correo)) {
            return { ok: false, mensaje: 'Ingresa un correo válido' };
        }

        const correoNormalizado = correo.trim().toLowerCase();
        const ocupado = usuarios.some((item) => item.correo === correoNormalizado && item.id !== id);
        if (ocupado) {
            return { ok: false, mensaje: 'Ese correo ya está en uso' };
        }

        const usuario = usuarios.find((item) => item.id === id);
        if (!usuario) {
            return { ok: false, mensaje: 'No se encontró la cuenta' };
        }

        const actualizado = {
            ...usuario,
            nombre: nombre.trim(),
            correo: correoNormalizado,
            iniciales: obtenerIniciales(nombre),
        };
        usuarios = usuarios.map((item) => (item.id === id ? actualizado : item));
        return { ok: true, usuario: usuarioPublico(actualizado) };
    },

    async cerrarSesion() {
        return { ok: true };
    },
};
