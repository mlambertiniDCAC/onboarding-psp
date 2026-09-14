# onboarding-psp

Herramienta interna (no depende de DCAC ni de ninguna sesión externa) con
**una sola pantalla**: el wizard de alta de cuenta CVU (steps 0-3, Persona
Física y Persona Jurídica). Pensada para que el área de producto pueda
correr el proceso de onboarding de una sociedad sin depender de un
desarrollador.

El código de `src/features/activateAccountCvu/**` es una **copia verbatim** de
`dcp-frontend` (`feature/psp`). Origen copiado desde el commit
`820e4dadf7e7a593a8c17869ed3419e979d8669f`. Para re-sincronizar:
`diff -r --exclude=__tests__ ../dcp-frontend/src/features/activateAccountCvu src/features/activateAccountCvu`.

## Flujo

Una sola pantalla de entrada, sin password: `mail` + `sujetoId`. Al enviarla
se llama a `POST /v1/auth/onboarding { mail, sujetoId, nombre, apellido }`
contra `apigateway-psp`, que:

- crea (o reutiliza) el usuario PSP en Keycloak para ese `mail`;
- crea/resuelve el sujeto de compliance para ese `sujetoId` y arranca su
  compliance si no existe;
- devuelve una sesión (token opaco) **ligada a ese `sujetoId` puntual** —
  el gateway rechaza (`403`) cualquier llamada a un `sujetoId` distinto del
  que abrió la sesión.

`nombre`/`apellido` van fijos (`"Operador" / "Interno"`) porque el mail no
es el de la persona física que se está dando de alta, sino el del
operador de producto usando la herramienta. El token y el `sujetoId`
quedan en `localStorage` y se renuevan solos (`POST /v1/auth/refresh`)
cuando expiran.

No hay branching de roles/enrollment (Flujo 1-5 del artifact de Puerta B):
esta pantalla reemplaza tanto el login como la selección de sujeto de un
cliente final — acá el "usuario" es siempre el operador de producto.

## Correr standalone (dev)

```bash
npm install
cp .env.example .env.development   # completar APIGW_PSP_URL
npm run dev
# abrir http://localhost:5175/
```

## Rutas del apigateway-psp que consume

`POST /v1/auth/onboarding` · `POST /v1/auth/refresh` ·
`GET /v1/compliance/:ref/drafts` · `GET /v1/compliance/steps` ·
`POST /v1/compliance/:ref/draft` · `PUT /v1/compliance/:ref/draft`.
`:ref` = sujetoId cargado en la pantalla de entrada; el border lo traduce al
`sujeto_verificado_id`.

## Deploy (Vercel + bridge local)

`apigateway-psp` sólo es alcanzable por la VPN WireGuard de quien lo opera,
así que el front (Vercel) no puede llamarlo directo. El puente es un
reverse proxy local (`bridge/`) expuesto por un túnel:

```
Vercel (onboarding-psp) → https://<túnel>.ngrok-free.app → bridge (local, :9000) → VPN → apigateway-psp
```

1. Con la VPN activa, levantar el bridge: ver `bridge/README.md`.
2. Exponerlo con `ngrok http 9000` (o `cloudflared tunnel` para una URL
   estable).
3. En Vercel, setear `APIGW_PSP_URL` = la URL pública del túnel.
4. Deploy (build-time: Vite hornea la variable en el bundle).

El bridge no agrega autenticación propia — reenvía el `Authorization` tal
cual. Es un entorno no productivo, expuesto solo mientras la VPN y el
túnel están activos.

## Build de prod (contenedor, alternativa a Vercel)

```bash
docker build -f Dockerfile.prod -t onboarding-psp .
```
