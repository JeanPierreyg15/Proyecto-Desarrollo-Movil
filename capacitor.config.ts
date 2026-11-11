import type { CapacitorConfig } from '@capacitor/cli';

// En desarrollo se permite HTTP y tráfico cleartext para hablar con el backend
// local (http://localhost:8000 o la IP LAN del PC). En release se exige HTTPS.
// Uso: CAPACITOR_ENV=production npm run cap:sync (o NODE_ENV=production).
const produccion =
  process.env.CAPACITOR_ENV === 'production' || process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
  appId: 'com.locker.app',
  appName: 'Locker',
  webDir: 'dist',
  server: produccion
    ? {
        androidScheme: 'https',
        cleartext: false,
      }
    : {
        androidScheme: 'http',
        cleartext: true,
      },
  plugins: {
    Keyboard: {
      resize: 'ionic',
    },
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#2563eb',
      showSpinner: false,
    },
  },
};

export default config;
