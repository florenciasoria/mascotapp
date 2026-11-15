# MascotApp

Plataforma web para la **adopción responsable de mascotas**. Conecta a personas que quieren adoptar
con refugios que publican mascotas, y le da a un administrador las herramientas para supervisar la
plataforma.

Proyecto final de Ingeniería Informática. Las donaciones se pagan con **Mercado Pago en modo de
prueba**: no se realiza ningún cobro real.

Versión publicada: https://mascotapp-ac2c8.web.app

## Funcionalidades por rol

| Rol               | Puede                                                                                                                                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Adoptante**     | Buscar mascotas con filtros, ver su detalle y ubicación, enviar solicitudes de adopción, seguirlas y cancelarlas, calificar las adopciones aceptadas, donar a un refugio con Mercado Pago, ver el comprobante de cada donación y descargar sus reportes en PDF |
| **Refugio**       | Publicar y editar mascotas con foto, aceptar o rechazar solicitudes, ver su historial, calificaciones y donaciones recibidas (con comprobante), y seguir su actividad en un panel con gráficos exportable a PDF                                                |
| **Administrador** | Aprobar o rechazar refugios, desactivar y reactivar cuentas, y supervisar la plataforma con totales, gráficos y actividad reciente, exportables a PDF                                                                                                          |

## Tecnologías

- **React 19** con **Vite** y **React Router**
- **Firebase**: Authentication (cuentas y verificación de email), Firestore (base de datos),
  Storage (fotos de las mascotas), **Cloud Functions** (pagos) y **Hosting** (publicación)
- **Mercado Pago Checkout Pro** con la API de Orders, en modo de prueba
- **Google Secret Manager** para las credenciales de Mercado Pago
- **Recharts** para los gráficos; **jsPDF**, **jspdf-autotable** y **html-to-image** para los
  reportes y comprobantes en PDF
- **Google Maps Embed API** para la ubicación de los refugios
- CSS Modules con variables de diseño propias (sin librerías de estilos)

## Cómo funciona una donación

1. El adoptante elige refugio e importe. La app llama a la función `createDonationOrder`.
2. La función valida los datos, crea la donación como `pendiente`, crea la orden en Mercado Pago y
   devuelve la página de pago.
3. El adoptante paga en Mercado Pago (la app nunca ve los datos de la tarjeta) y vuelve a la
   pantalla de resultado, que espera la confirmación en tiempo real.
4. Mercado Pago avisa a la función `mercadoPagoWebhook`, que verifica la firma del aviso, consulta
   la orden a la API y guarda en la donación el estado (`aprobada`, `rechazada` o `pendiente`) y el
   comprobante del pago.

En toda la app (listados, gráficos, totales y reportes) se cuentan **solo las donaciones aprobadas**.

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
└── utils/        Funciones puras y constantes: validaciones, filtros, formatos, reportes PDF
functions/        Cloud Functions: createDonationOrder y mercadoPagoWebhook
```

## Seguridad

- La validación en pantalla es para la experiencia de uso; **la seguridad real está en las reglas**
  de Firestore ([firestore.rules](firestore.rules)) y de Storage ([storage.rules](storage.rules)).
  Todo lo que no está permitido explícitamente queda denegado.
- Las **donaciones solo las crean y actualizan las Cloud Functions**: ningún usuario puede crear o
  modificar una donación desde el navegador.
- Las credenciales de Mercado Pago están en **Secret Manager**, nunca en el código ni en la app.
  Los datos de `.env.local` no se suben al repositorio.

## Requisitos

- Node.js 24 y npm
- Firebase CLI: `npm install -g firebase-tools` y después `firebase login`
- Un proyecto de Firebase en el plan **Blaze** (Cloud Functions lo requiere)
- Una cuenta en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers) con una
  aplicación de Checkout Pro

## Correr la app en la computadora

1. Instalar las dependencias de la app y de las funciones:

   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

2. Crear el archivo `.env.local` a partir de [.env.example](.env.example) con los datos del
   proyecto de Firebase y la API key de Google Maps.

3. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La app queda en `http://localhost:5173`. Los pagos se prueban desde la versión publicada,
   porque Mercado Pago no permite volver a `localhost` después de pagar.

Otros comandos: `npm run lint` (revisión del código) y `npm run build` (versión para publicar).

## Configuración de Firebase

El proyecto ya está vinculado en [.firebaserc](.firebaserc) y [firebase.json](firebase.json).

- **Reglas e índices** (están en el repositorio):

  ```bash
  firebase deploy --only firestore:rules,firestore:indexes,storage
  ```

- **Administrador:** se crea registrando un usuario y cambiando su `role` a `admin` desde la
  consola de Firestore.

## Mercado Pago y Cloud Functions

1. En Mercado Pago Developers, dentro de la aplicación, copiar el **Access Token de prueba**
   (Credenciales → Prueba).
2. En **Configuración de webhooks** (modo Prueba), cargar la URL
   `https://southamerica-west1-<id-del-proyecto>.cloudfunctions.net/mercadoPagoWebhook`, elegir el
   evento **Order (Mercado Pago)** y guardar. Copiar la **firma secreta** que se genera.
3. Guardar las dos credenciales como secrets (el comando las pide sin mostrarlas):

   ```bash
   firebase functions:secrets:set MP_ACCESS_TOKEN
   firebase functions:secrets:set MP_WEBHOOK_SECRET
   ```

4. Publicar las funciones (región `southamerica-west1`, la misma que Firestore):

   ```bash
   firebase deploy --only functions
   ```

   Si falla con _"Timeout after 10000"_, darle más tiempo a la carga del código. En PowerShell:
   `$env:FUNCTIONS_DISCOVERY_TIMEOUT=30; firebase deploy --only functions`

## Publicar en Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

Después de la primera publicación, agregar `https://<id-del-proyecto>.web.app/*` y
`https://<id-del-proyecto>.firebaseapp.com/*` a las restricciones de la API key de Google Maps.

## Probar un pago

En una ventana de incógnito, desde la versión publicada, hacer una donación y pagar **sin iniciar
sesión en Mercado Pago**, con una tarjeta de prueba de Mercado Pago (por ejemplo, Mastercard
5031 7557 3453 0604, vencimiento 11/30, código 123, DNI 12345678). El nombre del titular define
el resultado:

| Titular | Resultado      |
| ------- | -------------- |
| `APRO`  | Pago aprobado  |
| `OTHE`  | Pago rechazado |
| `CONT`  | Pago pendiente |
