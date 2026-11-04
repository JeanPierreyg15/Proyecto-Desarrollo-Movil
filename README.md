# Locker

Aplicacion movil para guardar y organizar links personales. Funciona como un baul donde el usuario almacena enlaces, los clasifica con etiquetas y los consulta cuando los necesite.

## Tecnologias

| Capa | Tecnologia | Version |
|------|------------|---------|
| Framework UI | Ionic React | 9.0.x |
| Libreria | React | 19.0.0 |
| Router | React Router | 6.30.x |
| Bundler | Vite | 8.x |
| Mobile | Capacitor | 8.5.x |
| Iconos | Ionicons | 8.1.x |
| Tests | Vitest / Cypress | 4.x / 13.x |

## Requisitos previos

- Node.js >= 18
- npm

## Instalacion

```bash
git clone https://github.com/<tu-usuario>/Proyecto-Desarrollo-Movil.git
cd Proyecto-Desarrollo-Movil
npm install
```

## Scripts disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Compila TypeScript y genera el build de produccion en `dist/` |
| `npm run preview` | Sirve el build de produccion localmente |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |
| `npm run test.unit` | Ejecuta tests unitarios con Vitest |
| `npm run test.e2e` | Ejecuta tests end-to-end con Cypress |

## Estructura del proyecto

```
src/
├── app/                          # Configuracion global de la app
│   ├── App.jsx                   # Rutas principales y providers
│   ├── TabsLayout.jsx            # Layout con tabs (Inicio, Etiquetas, Perfil)
│   ├── app.css                   # Estilos globales, variables de tema, animaciones
│   └── theme.js                  # Helpers de modo oscuro (toggle, persistencia)
│
├── features/
│   ├── auth/                     # Autenticacion
│   │   ├── assets/               # Logo (SVG y PNG)
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Provider global de autenticacion
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx     # Inicio de sesion
│   │   │   ├── RegisterPage.jsx  # Registro de usuario
│   │   │   └── PasswordRecoveryPage.jsx  # Recuperar contrasena
│   │   ├── services/
│   │   │   └── authService.js    # Logica de auth (actualmente in-memory)
│   │   └── auth.css              # Estilos compartidos de auth
│   │
│   ├── links/                    # Gestion de links
│   │   ├── components/
│   │   │   ├── LinkCard.jsx      # Tarjeta individual de un link
│   │   │   ├── LinkCard.css
│   │   │   ├── LinkFormModal.jsx # Modal para agregar un link
│   │   │   └── FilterButtons.jsx # Botones de filtro por categoria
│   │   ├── pages/
│   │   │   ├── LinkListPage.jsx  # Pantalla principal (Home)
│   │   │   └── LinkListPage.css
│   │   └── services/
│   │       └── linkService.js    # Servicio de links (actualmente datos mock)
│   │
│   ├── tags/                     # Gestion de etiquetas
│   │   ├── components/
│   │   │   └── TagCard.jsx       # Tarjeta de etiqueta
│   │   ├── pages/
│   │   │   ├── TagsPage.jsx      # Pantalla de etiquetas
│   │   │   └── TagsPage.css
│   │   └── services/
│   │       └── tagService.js     # Servicio de etiquetas (actualmente datos mock)
│   │
│   └── profile/                  # Perfil de usuario
│       └── pages/
│           ├── ProfilePage.jsx   # Pantalla de perfil completa
│           ├── ProfilePage.css
│           ├── ChangePasswordPage.jsx  # Pagina independiente para cambiar contrasena
│           └── ChangePasswordPage.css
│
└── main.jsx                      # Punto de entrada (imports de Ionic, init del tema)
```

## Rutas

| Ruta | Pagina | Descripcion |
|------|--------|-------------|
| `/` | LoginPage | Inicio de sesion |
| `/registro` | RegisterPage | Registro de nuevo usuario |
| `/recuperar` | PasswordRecoveryPage | Recuperar contrasena por correo |
| `/cambiar-contrasena` | ChangePasswordPage | Cambiar contrasena (con boton volver al perfil) |
| `/pages/Home` | LinkListPage | Pantalla principal con la lista de links |
| `/pages/Etiquetas` | TagsPage | Grilla de etiquetas |
| `/pages/Perfil` | ProfilePage | Perfil del usuario con ajustes |

## Navegacion

La app usa **IonReactRouter** con dos niveles de rutas:

1. **Rutas de nivel superior** (en `App.jsx`): Login, Registro, Recuperar contrasena, Cambiar contrasena.
2. **Rutas con tabs** (en `TabsLayout.jsx`): Home, Etiquetas y Perfil dentro de `IonTabs` con barra inferior.

La navegacion entre tabs no recarga la pagina. Las paginas como "Cambiar contrasena" son rutas de nivel superior con `IonBackButton` para volver al perfil.

## Funcionalidades del frontend

### Autenticacion
- Login con correo y contrasena (validaciones en tiempo real)
- Registro con nombre, correo, contrasena y confirmacion
- Recuperacion de contrasena por correo
- Cambio de contrasena en pagina independiente
- Los datos se almacenan **in-memory** (se pierden al recargar la pagina). Pendiente de conectar a backend.

### Home (Mi Baul)
- Lista de links guardados con tarjeta (imagen, titulo, URL, tiempo, etiquetas)
- Barra de busqueda en tiempo real
- Filtros por categoria (toggle multiple)
- Boton flotante (+) para agregar un link (abre modal)
- **Skeleton loader** mientras cargan los datos
- **Estado vacio ilustrado**: mensaje + boton cuando no hay links o no hay resultados de busqueda

### Etiquetas
- Grilla 2 columnas con tarjetas de etiquetas (icono, titulo, cantidad)
- Tarjeta fantasma (+) para crear nueva etiqueta
- **Skeleton loader** mientras cargan los datos

### Perfil
- Avatar con iniciales y **selector de 8 colores** (el color se refleja en el header de Home)
- Estadisticas: links, etiquetas, dias activo
- Formulario de informacion personal: nombre, correo, bio
- Seccion **Apariencia**: toggle de modo oscuro
- Seccion **Seguridad**: navega a la pagina de cambiar contrasena
- Seccion **Cuenta**: cerrar sesion (con confirmacion) y eliminar cuenta (con confirmacion)

### Modo oscuro
- Usa la paleta nativa de Ionic (`.ion-palette-dark`)
- Variables CSS semanticas (`--app-surface`, `--app-border`, `--app-text`, `--app-text-muted`, `--app-surface-soft`) definidas en `app.css`
- Persistencia en `localStorage` (clave: `locker-theme`)
- Respeta la preferencia del sistema (`prefers-color-scheme`) la primera vez
- Toggle en la seccion Apariencia del perfil
- Todas las pantallas estan adaptadas: auth, Home, etiquetas, perfil

### Animaciones
- Animacion de entrada (`aparecer-subiendo`): fade + deslizamiento en tarjetas y secciones
- Skeleton loaders con efecto de brillo animado
- Respeta `prefers-reduced-motion` del sistema

## Modelo de datos actual (in-memory)

### Usuario
```js
{
  id: string,          // UUID generado con crypto.randomUUID()
  nombre: string,
  correo: string,
  iniciales: string,   // Primeras letras del nombre (max 2)
  avatarColor: string, // Color hex del fondo del avatar
  creadoEn: string     // ISO timestamp
}
```

### Link
```js
{
  id: number,
  titulo: string,
  url: string,
  imagen: string,      // URL de la imagen/thumbnail
  tiempo: string,      // Tiempo relativo ("2h")
  etiquetas: string[]  // Nombres de las etiquetas asignadas
}
```

### Etiqueta
```js
{
  id: number,
  titulo: string,
  cantidad: number,    // Cantidad de links con esta etiqueta
  icono: string        // Emoji representativo
}
```

## Variables de tema (CSS Custom Properties)

Definidas en `src/app/app.css`:

| Variable | Modo claro | Modo oscuro | Uso |
|----------|-----------|-------------|-----|
| `--app-surface` | `#ffffff` | `#1c1c1e` | Fondo de tarjetas y secciones |
| `--app-surface-soft` | `#f3f4f6` | `#2c2c2e` | Fondos secundarios (inputs, badges) |
| `--app-border` | `#e5e7eb` | `#38383a` | Bordes de tarjetas y separadores |
| `--app-text` | `#111827` | `#ffffff` | Texto principal |
| `--app-text-muted` | `#6b7280` | `#c7c7cc` | Texto secundario/descriptivo |

El color primario (`--ion-color-primary: #2563eb`) se mantiene igual en ambos modos.

## Servicios (capa de datos)

Los servicios estan en `src/features/*/services/` y actualmente devuelven datos mock con un delay de 600ms para simular llamadas al backend. Estan preparados para ser reemplazados por llamadas a una API real (Supabase, Firebase, etc.) sin modificar los componentes.

| Servicio | Archivo | Metodos |
|----------|---------|---------|
| Auth | `authService.js` | `iniciarSesion`, `registrar`, `solicitarRecuperacion`, `restablecerPassword`, `actualizarPerfil`, `actualizarAvatar`, `cerrarSesion` |
| Links | `linkService.js` | `listar` |
| Tags | `tagService.js` | `listar` |

## Contexto global

`AuthContext` (en `AuthContext.jsx`) provee a toda la app:

| Propiedad/Metodo | Tipo | Descripcion |
|-------------------|------|-------------|
| `usuario` | object \| null | Datos del usuario logueado |
| `iniciarSesion(credenciales)` | async function | Login con correo y contrasena |
| `registrar(datos)` | async function | Registro de usuario nuevo |
| `solicitarRecuperacion(datos)` | async function | Enviar correo de recuperacion |
| `restablecerPassword(datos)` | async function | Restablecer contrasena |
| `actualizarPerfil({nombre, correo})` | async function | Actualizar nombre y correo |
| `actualizarAvatar(color)` | async function | Cambiar color del avatar |
| `cerrarSesion()` | async function | Cerrar sesion |

## Proximos pasos (backend)

- [ ] Crear proyecto en Supabase
- [ ] Configurar Auth de Supabase (reemplazar authService.js)
- [ ] Crear tablas: usuarios, links, etiquetas, links_etiquetas
- [ ] Crear buckets de Storage: `avatars` (publico) y `link-images` (privado)
- [ ] Configurar Row Level Security (RLS) para que cada usuario vea solo sus datos
- [ ] Reemplazar linkService.js y tagService.js con llamadas a Supabase
- [ ] Conectar Storage para subir imagenes de links y avatares
