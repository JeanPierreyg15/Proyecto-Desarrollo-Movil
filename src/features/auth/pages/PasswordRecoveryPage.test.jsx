import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { restablecerMock, cerrarSesionMock } = vi.hoisted(() => ({
    restablecerMock: vi.fn(),
    cerrarSesionMock: vi.fn(),
}));

vi.mock('@ionic/react', () => ({
    IonPage: ({ children }) => <div>{children}</div>,
    IonContent: ({ children }) => <div>{children}</div>,
    IonInput: ({ value, onIonInput, ...props }) => (
        <input
            aria-label={props.label}
            value={value ?? ''}
            onChange={(evento) => onIonInput?.({ detail: { value: evento.target.value } })}
        />
    ),
    IonButton: ({ children, ...props }) => <button {...props}>{children}</button>,
    IonInputPasswordToggle: () => null,
    useIonToast: () => [vi.fn()],
    useIonRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../context/AuthContext.jsx', () => ({
    useAuth: () => ({
        solicitarRecuperacion: vi.fn(),
        restablecerPassword: (...args) => restablecerMock(...args),
        cerrarSesion: (...args) => cerrarSesionMock(...args),
    }),
}));

import PasswordRecoveryPage from './PasswordRecoveryPage.jsx';

function renderizarConCodigo(codigo) {
    render(
        <MemoryRouter initialEntries={[`/recuperar?codigo=${codigo}`]}>
            <PasswordRecoveryPage />
        </MemoryRouter>
    );
}

describe('PasswordRecoveryPage con enlace de recuperación', () => {
    afterEach(cleanup);

    beforeEach(() => {
        restablecerMock.mockReset();
        restablecerMock.mockResolvedValue({ ok: true });
        cerrarSesionMock.mockReset();
        cerrarSesionMock.mockResolvedValue({ ok: true });
    });

    it('abre directamente el paso del código', () => {
        renderizarConCodigo('codigo-123');

        expect(screen.getByText('Revisa tu correo y pega el código recibido')).toBeTruthy();
        expect(screen.getByLabelText('Código de recuperación').value).toBe('codigo-123');
    });

    it('cierra la sesión y no muestra el correo en el mensaje final', async () => {
        renderizarConCodigo('codigo-123');

        fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
            target: { value: 'secreto123' },
        });
        fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
            target: { value: 'secreto123' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }));

        await waitFor(() => expect(restablecerMock).toHaveBeenCalledTimes(1));
        expect(restablecerMock).toHaveBeenCalledWith({ token: 'codigo-123', password: 'secreto123' });
        await waitFor(() => expect(cerrarSesionMock).toHaveBeenCalledTimes(1));

        expect(
            screen.getByText('Tu contraseña se actualizó. Inicia sesión con tu nueva contraseña.')
        ).toBeTruthy();
        expect(screen.queryByText(/ana@ejemplo\.com/)).toBeNull();
    });
});
