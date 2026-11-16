# Locker — Frontend (Ionic + React)

App móvil para guardar y organizar enlaces personales, con etiquetas, búsqueda,
vista previa automática de los links (título y miniatura), perfil con foto y
modo oscuro. Consume la API de `Backend-MovilLocker` (FastAPI).

> Esta versión necesita el backend con los endpoints `/auth/foto` y
> `/links/preview` (migraciones hasta `0007_imagen_links`).

## Tecnologías

| Capa | Tecnología |
|------|------------|
| UI | Ionic React 9 |
| Librería | React 19 |
| Router | React Router 6 |
| Bundler | Vite 8 |
| Móvil | Capacitor 8 (`@capacitor/android`, `@capacitor/ios`, `@capacitor/preferences`, `@capacitor/browser`, `@capacitor/share`, `@capacitor/clipboard`, `@capacitor/app`, `@capacitor/status-bar`, `@capacitor/keyboard`, `@capacitor/splash-screen`) |
| Almacenamiento seguro | `@aparajita/capacitor-secure-storage` (Keystore / Keychain) |
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

Para que Android permita al build de desarrollo llamar al backend local por
HTTP, el manifiesto debe usar el placeholder
`android:usesCleartextTraffic="${usesCleartextTraffic}"`. Define ese placeholder
como `"true"` para `debug` y `"false"` para `release` en
`android/app/build.gradle`; el proyecto Android está excluido de Git, así que
hay que aplicar esta configuración localmente al crearlo o regenerarlo.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Build de producción en `dist/` (exige `VITE_API_URL` https) |
| `npm run build:dev` | Build de desarrollo para Android (permite API local HTTP) |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run test.unit` | Igual que `npm run test` |
| `npm run test.unit:watch` | Tests en modo watch |
| `npm run cap:sync` | Sincroniza `dist/` con los proyectos nativos (`cap sync`) |
| `npm run android` | Abre el proyecto Android en Android Studio |

## Funcionalidades

### Autenticación
- Login y registro con validaciones compartidas (`src/app/validaciones.js`).
- Sesión persistida con almacenamiento seguro (`@aparajita/capacitor-secure-storage`,
  Keystore en Android / Keychain en iOS) y `localStorage` en web. Los tokens
  guardados antes en `@capacitor/preferences` se migran automáticamente al
  almacén seguro y se borra la copia en texto plano.
- Si la app arranca sin conexión, se muestra la última copia local del perfil y
  el token se conserva; un 401 sí cierra la sesión y borra esa copia.
- Recuperación de contraseña en 3 pasos: correo → código + nueva contraseña → listo.
  En desarrollo (`DEBUG=true` en el backend) el código se rellena automáticamente
  solo si el backend responde a una petición desde loopback. En producción el
  backend envía el código por SMTP.
- Sesión expirada: cualquier 401 limpia el token y redirige al login.
- Cambio de contraseña real (`PUT /auth/password`) que invalida sesiones anteriores.

### Inicio (Mi Baúl)
- Encabezado con el título y el avatar (iniciales o foto) a la derecha, que
  lleva al Perfil. El estilo `.header-info` es común a las tres pestañas y vive
  en `src/app/app.css`.
- Lista de enlaces con imagen, título, dominio, etiquetas y tiempo relativo
  (`Intl.RelativeTimeFormat`). Los links multimedia (YouTube, Vimeo, Spotify,
  TikTok...) muestran su **miniatura** en 16:9; las páginas normales, solo el
  **icono del sitio**. Los links de YouTube guardados antes de esta función
  también muestran miniatura, porque se calcula del ID del video.
- Abrir el enlace tocando la tarjeta: `@capacitor/browser` en móvil, pestaña nueva en web.
- Menú de acciones: abrir, copiar, compartir, editar y eliminar. En móvil usa
  el portapapeles y el selector de compartir nativos de Capacitor.
- Crear y editar links (con normalización de URLs).
- **Vista previa automática (web scraping)**: al escribir o pegar una URL, tras
  600 ms se consulta `GET /links/preview` y se autocompleta el título (sin pisar
  uno escrito a mano), mostrando la miniatura o el icono, el sitio y la
  descripción. La miniatura se guarda con el link.
- Búsqueda por título, URL o etiqueta y filtros por etiqueta.
- Scroll infinito por páginas de 50: ya no desaparecen los links a partir del
  101. El contador de la cabecera usa el total real del backend (`/links/count`).
- Pull-to-refresh, skeletons, estado vacío y estado de error con “Reintentar”.
- Datos recargados al entrar a la pestaña (`useIonViewWillEnter`) y, además,
  al instante cuando cambian etiquetas o links en otra pestaña (ver
  *Sincronización entre pestañas*).
- Botón atrás de Android: desde Etiquetas/Perfil vuelve a Inicio y desde Inicio
  minimiza la app en vez de cerrarla de golpe.

### Etiquetas
- Crear etiqueta con nombre e icono elegido por el usuario. La lista se
  actualiza al momento con la respuesta del servidor, sin recargar ni mostrar
  el skeleton.
- Ver links de la etiqueta, renombrar/cambiar icono y eliminar.
- Conteo de links por etiqueta calculado en el backend (`links_count`), no a
  partir de los primeros 100 links. Se refresca solo al crear, editar o borrar links.

### Perfil
- **Foto de perfil**: botón de cámara sobre el avatar para subir, cambiar o
  quitar la foto. Se recorta al centro y se reduce a 256×256 JPEG en el
  dispositivo (`src/app/imagenes.js`) antes de enviarla a `PUT /auth/foto`.
- Sin foto, avatar con iniciales y selector de color persistido en el backend.
- Edición de nombre y bio (el correo no se puede cambiar en esta versión).
- Estadísticas reales de links y etiquetas, actualizadas solas ante cualquier cambio.
- Modo oscuro persistido (Preferences en nativo, `localStorage` en web) y barra
  de estado ajustada al tema.
- Cerrar sesión y eliminar cuenta (con confirmación de contraseña).

### Sincronización entre pestañas
Las pestañas de Ionic quedan montadas en memoria, así que una pestaña no se
entera sola de lo que cambia en otra. `src/app/eventos.js` es un bus de eventos
mínimo: `tagService` emite `ETIQUETAS_CAMBIADAS` y `linkService` emite
`LINKS_CAMBIADOS` tras cada creación, edición o borrado. Inicio, Etiquetas y
Perfil se suscriben con `escuchar()` y recargan en segundo plano, sin tener que
refrescar la página.

## Estructura

```
src/
├── app/
│   ├── App.jsx              # Rutas principales y providers
│   ├── TabsLayout.jsx       # Tabs Inicio / Etiquetas / Perfil
│   ├── ProteccionRutas.jsx  # Rutas protegidas y públicas
│   ├── apiClient.js         # fetch central, timeout 15 s y manejo de 401
│   ├── almacenamiento.js    # Token y perfil en almacén seguro (localStorage en web)
│   ├── enlaces.js           # Abrir, copiar y compartir enlaces
│   ├── eventos.js           # Bus de eventos entre pestañas (etiquetas / links)
│   ├── imagenes.js          # Recorte y reducción de la foto de perfil
│   ├── validaciones.js      # Email, contraseña, URLs, favicon, miniatura de YouTube, tiempo relativo
│   ├── app.css              # Tema, encabezado común, skeletons y estados vacíos
│   └── theme.js             # Modo oscuro + barra de estado
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
npm run test
```

Los tests cubren las utilidades compartidas (validaciones, URLs, contraseñas),
la apertura de enlaces, el portapapeles y el selector nativo, el cliente HTTP y
los errores 401, la restauración de sesión con y sin red, el registro, la
recuperación de contraseña, el almacenamiento seguro y su migración, el
formulario de links (incluido el autocompletado del título por la vista previa,
que no pisa un título escrito a mano, y el guardado de la miniatura de YouTube),
las rutas de `/pages`, la lista de enlaces (refresco silencioso, carreras y
filtros), las etiquetas (error y paginación), la accesibilidad de `LinkCard` y
el botón atrás de Android (68 tests).

> Si Vitest falla con `Failed to resolve import "@testing-library/jest-dom/vitest"`,
> falta instalar dependencias: ejecuta `npm install`.

### Ver la app como en un celular

Con `npm run dev` corriendo, abre `http://localhost:5173` en Chrome, pulsa
**F12** y luego **Ctrl+Shift+M** para el modo dispositivo (por ejemplo,
iPhone 14 o Pixel 7).

## Compilar para móvil (Capacitor)

Para probar en el emulador Android con el backend local, configura en `.env`
`VITE_API_URL=http://10.0.2.2:8000`, inicia el backend en el PC y ejecuta:

```powershell
npm run build:dev
npm run cap:sync
npm run android
```

Inicia el backend por separado desde su proyecto con
`uvicorn main:app --reload --host 0.0.0.0 --port 8000`.
`10.0.2.2` es la dirección del PC vista desde el emulador; en un teléfono físico
usa la IP LAN del PC en `VITE_API_URL`.

Para un build de producción, usa una URL HTTPS:

```bash
$env:VITE_API_URL='https://api.tu-dominio.com'
npm run build
npm run cap:sync
npm run android
```

### Configuración por entorno

`capacitor.config.ts` decide el esquema del WebView según `CAPACITOR_ENV`:

| Entorno | Activación | `server` |
|---------|------------|----------|
| Desarrollo (por defecto) | — | `androidScheme: "http"`, `cleartext: true` |
| Producción | `CAPACITOR_ENV=production` o `NODE_ENV=production` | `androidScheme: "https"`, `cleartext: false` |

Ejemplo en PowerShell:

```powershell
$env:CAPACITOR_ENV='production'
$env:VITE_API_URL='https://api.tu-dominio.com'
npm run cap:sync
Remove-Item Env:CAPACITOR_ENV
```

### Build de producción

`vite.config.js` falla a propósito si `VITE_API_URL` no está definida o no
empieza por `https://`, para que un build de producción no apunte sin avisar a
`localhost`. En desarrollo basta con el `.env` local (`http://localhost:8000`).

Recomendaciones:

- Prueba siempre el flujo de red en un emulador/dispositivo antes de darlo por
  cerrado: `localhost` en el dispositivo no es tu PC.
- Añade los orígenes del WebView al `CORS_ORIGINS` del backend:
  `capacitor://localhost`, `https://localhost` y (en desarrollo con
  `androidScheme: http`) `http://localhost`.
- Tras generar el proyecto Android por primera vez, pon `android:allowBackup="false"`
  en `android/app/src/main/AndroidManifest.xml` para que las copias de seguridad
  del sistema no extraigan el almacén seguro. El proyecto nativo no se versiona
  en este repositorio, así que este paso hay que repetirlo al regenerarlo.
- Genera iconos y splash nativos con `@capacitor/assets`.
