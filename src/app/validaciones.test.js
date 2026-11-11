import { describe, expect, it } from 'vitest';
import {
    bytesDePassword,
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

    it('cuenta bytes UTF-8, no caracteres (límite de bcrypt)', () => {
        expect(bytesDePassword('ñ')).toBe(2);
        expect(bytesDePassword('a')).toBe(1);
        expect(passwordValida('ñ'.repeat(40))).toBe(false);
        expect(passwordValida('a'.repeat(72))).toBe(true);
        expect(passwordValida('a'.repeat(73))).toBe(false);
    });
});

describe('normalizarUrl', () => {
    it('añade https cuando falta el esquema', () => {
        expect(normalizarUrl('react.dev')).toBe('https://react.dev');
        expect(normalizarUrl('  http://ejemplo.com/ruta  ')).toBe('http://ejemplo.com/ruta');
    });

    it('acepta host:puerto sin esquema', () => {
        expect(normalizarUrl('localhost:3000')).toBe('https://localhost:3000');
        expect(normalizarUrl('midominio.com:8080/ruta')).toBe('https://midominio.com:8080/ruta');
        expect(normalizarUrl('midominio.com:8080?x=1')).toBe('https://midominio.com:8080?x=1');
        expect(normalizarUrl('midominio.com:8080#inicio')).toBe('https://midominio.com:8080#inicio');
    });

    it('rechaza esquemas peligrosos', () => {
        expect(normalizarUrl('javascript:alert(1)')).toBe('');
        expect(normalizarUrl('data:text/html,<h1>x</h1>')).toBe('');
        expect(normalizarUrl('file:///etc/passwd')).toBe('');
        expect(normalizarUrl('mailto:ana@ejemplo.com')).toBe('');
        expect(normalizarUrl('ftp://ejemplo.com/archivo')).toBe('');
        expect(normalizarUrl('   ')).toBe('');
    });

    it('exige un hostname real y limita a 2048 caracteres', () => {
        expect(normalizarUrl('https://user@')).toBe('');
        expect(normalizarUrl('https://.')).toBe('');
        expect(normalizarUrl('http://.')).toBe('');
        expect(normalizarUrl('https://')).toBe('');
        expect(normalizarUrl('https://ejemplo.com/' + 'x'.repeat(2048))).toBe('');
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

    it('interpreta como UTC las fechas sin zona que devuelve SQLite', () => {
        // SQLite/Pydantic podían devolver "2026-11-09T12:00:00" sin Z.
        const haceDiezMinutos = new Date(Date.now() - 10 * 60 * 1000);
        const sinZona = haceDiezMinutos.toISOString().replace('Z', '');
        expect(tiempoRelativo(sinZona)).toContain('minuto');
        expect(tiempoRelativo(sinZona)).not.toContain('hora');
    });
});
