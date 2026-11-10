import { IonPage, IonContent, IonInput, IonButton, useIonToast, IonInputPasswordToggle, useIonRouter } from '@ionic/react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { correoValido, passwordValida, LONGITUD_MINIMA_PASSWORD } from '../../../app/validaciones.js';
import logo from '../assets/logo.svg';
import '../auth.css';
import './PasswordRecoveryPage.css';

function Recuperar() {
    const [parametros] = useSearchParams();
    const codigoEnlace = parametros.get('codigo') ?? '';
    const [correo, setCorreo] = useState('');
    const [codigo, setCodigo] = useState(codigoEnlace);
    const [password, setPassword] = useState('');
    const [confirmar, setConfirmar] = useState('');
    // El enlace del correo puede traer ?codigo=... y abrir directamente el paso 2.
    const [paso, setPaso] = useState(codigoEnlace ? 'codigo' : 'correo');
    const [mensajeEnvio, setMensajeEnvio] = useState('');
    const [intentoEnviar, setIntentoEnviar] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [mostrarToast] = useIonToast();
    const router = useIonRouter();
    const { solicitarRecuperacion, restablecerPassword } = useAuth();

    const mostrarError = (mensaje) => {
        mostrarToast({
            message: mensaje,
            duration: 2500,
            color: 'danger',
            position: 'bottom',
        });
    };

    const manejarCorreo = async (e) => {
        e.preventDefault();
        setIntentoEnviar(true);
        if (!correo.trim() || !correoValido(correo)) {
            return;
        }

        setProcesando(true);
        const resultado = await solicitarRecuperacion({ correo });
        setProcesando(false);
        if (!resultado.ok) {
            mostrarError(resultado.mensaje);
            return;
        }

        setMensajeEnvio(resultado.mensaje);
        if (resultado.codigoDesarrollo) {
            // Solo en desarrollo local (DEBUG=true + loopback): el backend devuelve el código.
            setCodigo(resultado.codigoDesarrollo);
            mostrarToast({
                message: 'Modo desarrollo: el código se rellenó automáticamente.',
                duration: 2500,
                color: 'medium',
                position: 'bottom',
            });
        }
        setPaso('codigo');
        setIntentoEnviar(false);
    };

    const manejarClave = async (e) => {
        e.preventDefault();
        setIntentoEnviar(true);
        if (!codigo.trim() || !passwordValida(password) || !confirmar || password !== confirmar) {
            return;
        }

        setProcesando(true);
        const resultado = await restablecerPassword({ token: codigo, password });
        setProcesando(false);
        if (!resultado.ok) {
            mostrarError(resultado.mensaje);
            return;
        }
        setPaso('listo');
    };

    const errorCorreo = intentoEnviar && paso === 'correo'
        ? !correo.trim()
            ? 'Ingresa tu correo electrónico.'
            : !correoValido(correo)
              ? 'Ingresa un correo electrónico válido.'
              : ''
        : '';
    const errorCodigo = intentoEnviar && paso === 'codigo' && !codigo.trim()
        ? 'Pega el código que recibiste.'
        : '';
    const errorPassword = intentoEnviar && paso === 'codigo' && !passwordValida(password)
        ? `Usa al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`
        : '';
    const errorConfirmar = intentoEnviar && paso === 'codigo'
        ? !confirmar
            ? 'Confirma tu contraseña.'
            : password !== confirmar
              ? 'Las contraseñas no coinciden.'
              : ''
        : '';

    return (
        <IonPage>
            <IonContent>
                <div className="login-container">
                    <div className="image-container">
                        <img className="logo-app" src={logo} alt="Logo" />
                        <h1>Recuperar contraseña</h1>
                        <p>
                            {paso === 'correo' && 'Ingresa el correo de tu cuenta'}
                            {paso === 'codigo' && 'Revisa tu correo y pega el código recibido'}
                            {paso === 'listo' && 'Ya puedes iniciar sesión con tu nueva contraseña'}
                        </p>
                    </div>
                    {paso === 'correo' && (
                        <form onSubmit={manejarCorreo} className="login-form" noValidate aria-busy={procesando}>
                            <IonInput
                                value={correo}
                                onIonInput={(e) => setCorreo(e.detail.value ?? '')}
                                labelPlacement="floating"
                                className="custom-input"
                                type="email"
                                label="Correo electrónico"
                                fill="outline"
                                shape="round"
                                color="primary"
                                autocomplete="email"
                                inputmode="email"
                                aria-invalid={Boolean(errorCorreo)}
                                aria-describedby={errorCorreo ? 'recuperar-correo-error' : undefined}
                            />
                            {errorCorreo && <p className="auth-field-error" id="recuperar-correo-error" role="alert">{errorCorreo}</p>}
                            <IonButton className="login-button" type="submit" expand="block" disabled={procesando}>
                                {procesando ? 'Enviando...' : 'Enviar código'}
                            </IonButton>
                            <Link to="/" className="auth-back">
                                Volver a iniciar sesión
                            </Link>
                        </form>
                    )}
                    {paso === 'codigo' && (
                        <form onSubmit={manejarClave} className="login-form" noValidate aria-busy={procesando}>
                            <p className="auth-field-hint" role="status">{mensajeEnvio}</p>
                            <IonInput
                                value={codigo}
                                onIonInput={(e) => setCodigo(e.detail.value ?? '')}
                                labelPlacement="floating"
                                className="custom-input"
                                type="text"
                                label="Código de recuperación"
                                fill="outline"
                                shape="round"
                                color="primary"
                                autocomplete="one-time-code"
                                aria-invalid={Boolean(errorCodigo)}
                                aria-describedby={errorCodigo ? 'recuperar-codigo-error' : undefined}
                            />
                            {errorCodigo && <p className="auth-field-error" id="recuperar-codigo-error" role="alert">{errorCodigo}</p>}
                            <IonInput
                                value={password}
                                onIonInput={(e) => setPassword(e.detail.value ?? '')}
                                labelPlacement="floating"
                                className="custom-input"
                                type="password"
                                label="Nueva contraseña"
                                fill="outline"
                                shape="round"
                                color="primary"
                                autocomplete="new-password"
                                aria-invalid={Boolean(errorPassword)}
                                aria-describedby={errorPassword
                                    ? 'recuperar-password-ayuda recuperar-password-error'
                                    : 'recuperar-password-ayuda'}
                            >
                                <div className="toggle-icon" slot="end">
                                    <IonInputPasswordToggle />
                                </div>
                            </IonInput>
                            <p className="auth-field-hint" id="recuperar-password-ayuda">
                                Usa al menos {LONGITUD_MINIMA_PASSWORD} caracteres.
                            </p>
                            {errorPassword && <p className="auth-field-error" id="recuperar-password-error" role="alert">{errorPassword}</p>}
                            <IonInput
                                value={confirmar}
                                onIonInput={(e) => setConfirmar(e.detail.value ?? '')}
                                labelPlacement="floating"
                                className="custom-input"
                                type="password"
                                label="Confirmar contraseña"
                                fill="outline"
                                shape="round"
                                color="primary"
                                autocomplete="new-password"
                                aria-invalid={Boolean(errorConfirmar)}
                                aria-describedby={errorConfirmar ? 'recuperar-confirmar-error' : undefined}
                            >
                                <div className="toggle-icon" slot="end">
                                    <IonInputPasswordToggle />
                                </div>
                            </IonInput>
                            {errorConfirmar && <p className="auth-field-error" id="recuperar-confirmar-error" role="alert">{errorConfirmar}</p>}
                            <IonButton className="login-button" type="submit" expand="block" disabled={procesando}>
                                {procesando ? 'Actualizando...' : 'Guardar contraseña'}
                            </IonButton>
                            <button type="button" className="auth-back auth-back-boton" onClick={() => setPaso('correo')}>
                                Usar otro correo
                            </button>
                        </form>
                    )}
                    {paso === 'listo' && (
                        <div className="login-form">
                            <div className="auth-success">
                                <p>Tu contraseña se actualizó. Inicia sesión con el correo {correo.trim().toLowerCase()}.</p>
                            </div>
                            <IonButton className="login-button" expand="block" onClick={() => router.push('/', 'root', 'replace')}>
                                Ir a iniciar sesión
                            </IonButton>
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
}

export default Recuperar;
