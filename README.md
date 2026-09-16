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
# apigateway-psp local necesita CORS_ORIGINS=http://localhost:5175
npm run dev
# abrir http://localhost:5175/
```

## Rutas del apigateway-psp que consume

`POST /v1/auth/onboarding` · `POST /v1/auth/refresh` ·
`GET /v1/compliance/:ref/drafts` · `GET /v1/compliance/steps` ·
`POST /v1/compliance/:ref/draft` · `PUT /v1/compliance/:ref/draft`.
`:ref` = sujetoId cargado en la pantalla de entrada; el border lo traduce al
`sujeto_verificado_id`.

## Deploy (Vercel)

El front llama directo a la URL pública de `apigateway-psp`.

1. En Vercel, setear `APIGW_PSP_URL` con la URL pública de `apigateway-psp`
   (no se commitea en el repo).
2. En `apigateway-psp`, agregar el dominio de Vercel a `CORS_ORIGINS`
   (lista separada por comas); si no, el navegador bloquea las llamadas.
3. Deploy (build-time: Vite hornea la variable en el bundle).

## Build de prod (contenedor, alternativa a Vercel)

```bash
docker build -f Dockerfile.prod -t onboarding-psp .
```
