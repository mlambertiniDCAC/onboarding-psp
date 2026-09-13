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

1. Login propio contra `apigateway-psp`: `POST /v1/auth/login { mail, password }`
   con una cuenta real del realm `psp`. El token queda en `localStorage` y se
   renueva solo (`POST /v1/auth/refresh`) cuando expira.
2. El operador carga manualmente el `sujetoId` de la sociedad a onboardear.
3. Se monta el wizard (`activateAccountCvu`) sobre ese `sujetoId`.

No hay branching de roles/enrollment (Flujo 1-5 del artifact de Puerta B):
el usuario de esta herramienta ya es una cuenta PSP real, no un cliente
final en onboarding.

## Correr standalone (dev)

```bash
npm install
cp .env.example .env.development   # completar APIGW_PSP_URL
npm run dev
# abrir http://localhost:5175/
```

## Rutas del apigateway-psp que consume

`POST /v1/auth/login` · `POST /v1/auth/refresh` ·
`GET /v1/compliance/:ref/drafts` · `GET /v1/compliance/steps` ·
`POST /v1/compliance/:ref/draft` · `PUT /v1/compliance/:ref/draft`.
`:ref` = sujetoId cargado a mano; el border lo traduce al `sujeto_verificado_id`.

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
