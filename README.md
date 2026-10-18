# MascotApp

Plataforma web para la **adopción responsable de mascotas**. Conecta a personas que quieren adoptar
con refugios que publican mascotas, y le da a un administrador las herramientas para supervisar la
plataforma.

Proyecto final de Ingeniería Informática. Los datos son simulados y las donaciones no realizan
ningún cobro real.

## Funcionalidades por rol

| Rol | Puede |
|---|---|
| **Adoptante** | Buscar mascotas con filtros, ver su detalle y ubicación, enviar solicitudes de adopción, seguirlas, cancelarlas, calificar las adopciones aceptadas y realizar donaciones simuladas |
| **Refugio** | Publicar y editar mascotas con foto, revisar las solicitudes que recibe (aceptar o rechazar), ver su historial, sus calificaciones y las donaciones recibidas |
| **Administrador** | Aprobar o rechazar refugios, desactivar y reactivar cuentas, y supervisar la plataforma con totales, gráficos y actividad reciente |

## Tecnologías

- **React 19** con **Vite** y **React Router**
- **Firebase**: Authentication (cuentas y verificación de email), Firestore (base de datos) y
  Storage (fotos de las mascotas)
- **Recharts** para los gráficos de la supervisión
- **Google Maps Embed API** para la ubicación de los refugios
- CSS Modules con variables de diseño propias (sin librerías de estilos)

## Estructura del código

```
src/
├── components/   Piezas reutilizables: ui/ (botones, campos, diálogos) y por tema
│                 (pets, requests, ratings, donations, charts, users)
├── context/      Sesión del usuario (AuthProvider)
├── hooks/        useAuth: acceso a la sesión desde cualquier componente
├── layouts/      Marco de las pantallas (menú lateral, pantallas de acceso)
├── pages/        Una pantalla por ruta, agrupadas por rol (adopter, shelter, admin, auth, shared)
├── routes/       ProtectedRoute: controla sesión, rol y estado de la cuenta
├── services/     Toda la comunicación con Firebase (ninguna pantalla usa Firebase directo)
├── styles/       Variables de diseño y estilos globales
└── utils/        Funciones puras y constantes: validaciones, filtros, opciones, formatos
```

## Seguridad

La validación en pantalla es para la experiencia de uso; **la seguridad real está en las reglas**
de Firestore ([firestore.rules](firestore.rules)) y de Storage ([storage.rules](storage.rules)),
que se ejecutan en los servidores de Google. Todo lo que no está permitido explícitamente queda
denegado.

## Cómo correrlo

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear el archivo `.env.local` a partir de [.env.example](.env.example) con los datos del
   proyecto de Firebase y la API key de Google Maps. Este archivo **no se sube al repositorio**.

3. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La app queda en `http://localhost:5173`.

Otros comandos: `npm run lint` (revisión del código) y `npm run build` (versión para publicar).

## Configuración de Firebase

- **Reglas:** publicar el contenido de `firestore.rules` y `storage.rules` en la consola de
  Firebase.
- **Índices compuestos** (Firestore → Índices), necesarios para los promedios y totales calculados
  en el servidor:
  - `ratings`: `shelterId`, `processScore`, `shelterScore` (ascendentes)
  - `donations`: `shelterId`, `amount` (ascendentes)
- **Administrador:** se crea registrando un usuario y cambiando su `role` a `admin` desde la
  consola de Firestore.
