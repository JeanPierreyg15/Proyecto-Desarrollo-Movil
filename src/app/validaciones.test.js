import { describe, expect, it } from 'vitest';
import {
    correoValido,
    dominioDeUrl,
    faviconDeUrl,
    normalizarUrl,
    obtenerIniciales,
    passwordValida,
    tiempoRelativo,
} from './validaciones.js';

describe('correoValido', () => {
    it('acepta correos con formato correcto', () => {
        expect(correoValido('ana@ejemplo.com')).toBe(true);
        expect(correoValido('  ana.perez+dev@sub.ejemplo.org  ')).toBe(true);
    });

    it('rechaza correos inválidos', () => {
        expect(correoValido('')).toBe(false);
        expect(correoValido('ana')).toBe(false);
        expect(correoValido('ana@ejemplo')).toBe(false);
        expect(correoValido('ana @@ejemplo.com')).toBe(false);
    });
});

describe('passwordValida', () => {
    it('exige al menos 8 caracteres', () => {
        expect(passwordValida('1234567')).toBe(false);
        expect(passwordValida('12345678')).toBe(true);
        expect(passwordValida(null)).toBe(false);
    });
});

describe('normalizarUrl', () => {
    it('añade https cuando falta el esquema', () => {
        expect(normalizarUrl('react.dev')).toBe('https://react.dev');
        expect(normalizarUrl('  http://ejemplo.com/ruta  ')).toBe('http://ejemplo.com/ruta');
    });

    it('rechaza esquemas peligrosos', () => {
        expect(normalizarUrl('javascript:alert(1)')).toBe('');
        expect(normalizarUrl('data:text/html,<h1>x</h1>')).toBe('');
        expect(normalizarUrl('file:///etc/passwd')).toBe('');
        expect(normalizarUrl('   ')).toBe('');
    });
});

describe('dominioDeUrl y faviconDeUrl', () => {
    it('extrae el dominio sin www', () => {
        expect(dominioDeUrl('https://www.react.dev/docs')).toBe('react.dev');
    });

    it('genera la URL del favicon', () => {
        expect(faviconDeUrl('react.dev')).toContain('react.dev');
        expect(faviconDeUrl('sin-dominio')).toBeNull();
    });
});

describe('obtenerIniciales', () => {
    it('toma hasta dos iniciales', () => {
        expect(obtenerIniciales('Ana María Pérez')).toBe('AM');
        expect(obtenerIniciales('Ana')).toBe('A');
        expect(obtenerIniciales('   ')).toBe('?');
    });
});

describe('tiempoRelativo', () => {
    it('devuelve null sin fecha', () => {
        expect(tiempoRelativo(null)).toBeNull();
        expect(tiempoRelativo('no-es-fecha')).toBeNull();
    });

    it('describe fechas recientes', () => {
        const haceUnMinuto = new Date(Date.now() - 60 * 1000).toISOString();
        expect(tiempoRelativo(haceUnMinuto)).toBeTypeOf('string');
        expect(tiempoRelativo(haceUnMinuto)).toContain('minuto');
    });
});
