import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // C4: un build de producción sin URL https apuntaría a localhost sin avisar.
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), '');
    const apiUrl = String(process.env.VITE_API_URL || env.VITE_API_URL || '').trim();

    if (!apiUrl) {
      throw new Error(
        'VITE_API_URL es obligatoria para compilar: define la URL pública de la API (https).'
      );
    }
    if (mode !== 'development' && !apiUrl.startsWith('https://')) {
      throw new Error(
        `VITE_API_URL debe usar https:// en un build de producción (valor actual: ${apiUrl}).`
      );
    }
  }

  return {
    plugins: [react()],
    // host: true permite probar la app desde un móvil/emulador usando la IP local del PC
    server: {
      host: true,
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{js,jsx}'],
      setupFiles: ['./src/setupTests.js'],
    },
  };
});
