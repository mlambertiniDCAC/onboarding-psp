# bridge

Reverse proxy local que expone `apigateway-psp` (solo alcanzable por la VPN
WireGuard de esta máquina) a través de un túnel público, para que el MFE
`onboarding-psp` desplegado en Vercel pueda llamarlo.

No agrega autenticación propia: reenvía tal cual el header `Authorization`
y el resto del request. Sin la VPN activa, `apigateway-psp` no responde.

## Correr

```bash
cd bridge
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

APIGW_PSP_URL=http://<ip-interna-vpn>:<puerto> python3 bridge.py
# escucha en :9000
```

En otra terminal, con la VPN activa:

```bash
ngrok http 9000
```

Tomá la URL pública que imprime ngrok (`https://xxxx.ngrok-free.app`) y
cargala como `VITE_APIGW_PSP_URL` en las env vars de Vercel del proyecto
`onboarding-psp`. Cada vez que ngrok se reinicia la URL cambia, así que hay
que actualizar la env var y redeployar.
