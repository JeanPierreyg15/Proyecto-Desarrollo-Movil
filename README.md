# Locker — Frontend (Ionic + React)

App móvil para guardar y organizar enlaces personales, con etiquetas, búsqueda,
perfil y modo oscuro. Consume la API de `Backend-MovilLocker` (FastAPI).

## Tecnologías

| Capa | Tecnología |
|------|------------|
| UI | Ionic React 9 |
| Librería | React 19 |
| Router | React Router 6 |
| Bundler | Vite 8 |
| Móvil | Capacitor 8 (`@capacitor/preferences`, `@capacitor/browser`) |
| Tests | Vitest + Testing Library |

## Requisitos

- Node.js >= 18
- npm
- Backend en ejecución (ver `../Backend-MovilLocker/README.md`)

## Instalación

```bash
npm install
cp .env.example .env   # en Windows: copy .env.example .env
```

Edita `.env` con la URL de la API según el entorno:

| Entorno | `VITE_API_URL` |
|---------|----------------|
| Web (Vite) | `http://localhost:8000` |
| Emulador Android | `http://10.0.2.2:8000` |
| Móvil físico (misma red) | `http://IP_DE_TU_PC:8000` |
| Producción | `https://tu-dominio.com` |

> `localhost` dentro de un emulador o teléfono apunta al propio dispositivo, no a
> tu PC. En Android, el backend además debe escuchar en `0.0.0.0` y el firewall
> debe permitir el puerto 8000.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | ESLint |
| `npm run test.unit` | Tests unitarios (Vitest) |
| `npm run test.unit:watch` | Tests en modo watch |

## Funcionalidades

### Autenticación
- Login y registro con validaciones compartidas (`src/app/validaciones.js`).
- Sesión persistida con `@capacitor/preferences` en móvil y `localStorage` en web.
- Recuperación de contraseña en 3 pasos: correo → código + nueva contraseña → listo.
  En desarrollo (`DEBUG=true` en el backend) el código se rellena automáticamente.
- Sesión expirada: cualquier 401 limpia el token y redirige al login.
- Cambio de contraseña real (`PUT /auth/password`) que invalida sesiones anteriores.

### Inicio (Mi Baúl)
- Lista de enlaces con favicon, título, dominio, etiquetas y tiempo relativo
  (`Intl.RelativeTimeFormat`).
- Abrir el enlace tocando la tarjeta: `@capacitor/browser` en móvil, pestaña nueva en web.
- Menú de acciones: abrir, copiar, compartir, editar y eliminar.
- Crear y editar links (con normalización de URLs).
- Búsqueda por título, URL o etiqueta y filtros por etiqueta.
- Pull-to-refresh, skeletons, estado vacío y estado de error con “Reintentar”.
- Datos recargados al entrar a la pestaña (`useIonViewWillEnter`).

### Etiquetas
- Crear etiqueta con nombre e icono elegido por el usuario.
- Ver links de la etiqueta, renombrar/cambiar icono y eliminar.
- Conteo de links por etiqueta y recarga al entrar a la pestaña.

### Perfil
- Avatar con iniciales y selector de color persistido en el backend.
- Edición de nombre y bio (el correo no se puede cambiar en esta versión).
- Estadísticas reales de links y etiquetas.
- Modo oscuro persistido.
- Cerrar sesión y eliminar cuenta (con confirmación de contraseña).

## Estructura

```
src/
├── app/
│   ├── App.jsx              # Rutas principales y providers
│   ├── TabsLayout.jsx       # Tabs Inicio / Etiquetas / Perfil
│   ├── ProteccionRutas.jsx  # Rutas protegidas y públicas
│   ├── apiClient.js         # fetch central, timeout 15 s y manejo de 401
│   ├── almacenamiento.js    # Token con Preferences/localStorage
│   ├── enlaces.js           # Abrir, copiar y compartir enlaces
│   ├── validaciones.js      # Email, contraseña, URLs, tiempo relativo
│   └── theme.js             # Modo oscuro
└── features/
    ├── auth/
    │   ├── context/AuthContext.jsx
    │   ├── services/authService.js
    │   └── pages/
    ├── links/
    │   ├── components/
    │   ├── pages/
    │   └── services/linkService.js
    ├── tags/
    │   ├── components/
    │   ├── pages/
    │   └── services/tagService.js
    └── profile/pages/
```

## Tests

```bash
npm run test.unit
```

Los tests actuales cubren las utilidades de `src/app/validaciones.js` (correos,
contraseñas, normalización de URLs, dominios/favicons y tiempo relativo).

## Compilar para móvil (Capacitor)

```bash
npm run build
npx cap sync
npx cap open android   # o ios
```

Recomendaciones:

- Usa HTTPS en producción. Android bloquea tráfico HTTP sin cifrar salvo que se
  configure `server.cleartext` **solo en desarrollo**.
- Añade los orígenes del WebView al `CORS_ORIGINS` del backend:
  `capacitor://localhost` y `https://localhost`.
- El token se guarda con `@capacitor/preferences` (SharedPreferences / UserDefaults).
  Para máxima seguridad en producción considera un plugin de almacenamiento seguro
  (Keychain/Keystore).
- Genera iconos y splash nativos con `@capacitor/assets`.
