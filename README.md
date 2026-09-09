# onboarding-psp

MFE (Module Federation remote) con **una sola pantalla**: el wizard de alta de
cuenta CVU (steps 0-3, Persona Física y Persona Jurídica).

El código de `src/features/activateAccountCvu/**` es una **copia verbatim** de
`dcp-frontend` (branch `migracion-usuarios`). Origen copiado desde el commit
`820e4dadf7e7a593a8c17869ed3419e979d8669f`. Para re-sincronizar:
`diff -r --exclude=__tests__ ../dcp-frontend/src/features/activateAccountCvu src/features/activateAccountCvu`.

## Correr standalone (dev)

```bash
npm install
# completá los valores en .env.development (VITE_APIGW_PSP_URL, VITE_DCAC_URL — ya trae defaults de dev)
npm run dev
# abrir http://localhost:5175/?ref=<sujeto_id_externo>
```

Con `VITE_ENABLE_LOGIN=true` el MFE usa `devAxiosInstance`: toma el Bearer de
`?token=<jwt>` o de `localStorage["tt"]`.

`.env.development` setea `VITE_ENABLE_LOGIN=true`, lo que fuerza `devAxiosInstance`
(Bearer desde `?token=` / `localStorage["tt"]`) y saltea el interceptor del host —
poné `false` para probar la auth real de federación localmente.

## Consumo desde un host (Module Federation)

- Remote: `onboardingPsp` · expone `./App` (`dist/assets/remoteEntry.js`).
- El host debe:
  1. exponer `dcac/axiosInstance` con un `attachAuthInterceptor(instance)` que
     agregue `Authorization: Bearer <token opaco PSP>`;
  2. montar `<App />` del remote;
  3. pasar el id del sujeto por prop `refExterna` (o setear
     `window.__ONBOARDING_PSP_PROPS__ = { refExterna, razonSocial }` antes de montar).
- `resolveRefExterna` también lee `?razon_social=<nombre>` de la query (opcional,
  cosmético — el wizard lo muestra como el nombre de la sociedad).
- `shared` singletons: `react`, `react-dom`, `react-router-dom`, `react-redux`,
  `redux-persist`.

### Fin del flujo

Después de "Enviar documentación" el wizard muestra el modal de éxito y luego
vuelve a su pantalla de intro (heredado de `dcp-frontend`, donde `/` era el home
del shell). Un host que quiera desmontar o redirigir el MFE al completarse debe
observar esa navegación a `/`. Cablear un prop explícito `onComplete` es un
follow-up (necesita input de producto sobre la UX post-envío).

## Rutas del apigateway-psp que consume

`GET /v1/compliance/:ref/drafts` · `GET /v1/compliance/steps` ·
`POST /v1/compliance/:ref/draft` · `PUT /v1/compliance/:ref/draft`.
`:ref` = `refExterna`; el border lo traduce al `sujeto_verificado_id`.

## Build de prod

```bash
docker build -f Dockerfile.prod -t onboarding-psp .
```

`npm run build` exige `.env.production` completo (guard en `vite.config.js`); para un bundle local sin config usá `npm run build:local`.

El `map` de CORS de `nginx.conf` (prod) solo habilita orígenes `https://*.dcac.ar`
y `https://*.decampoacampo.com`; cualquier otro dominio de host no recibe headers
CORS y hay que agregarlo al `map`.
