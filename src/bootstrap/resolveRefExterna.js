/**
 * Resuelve el id externo del sujeto (refExterna) con esta precedencia:
 *   1. prop de montaje explícita (`props.refExterna`)
 *   2. `window.__ONBOARDING_PSP_PROPS__.refExterna` (lo setea el host antes de montar)
 *   3. query param `?ref=<id>`
 * Devuelve `{ refExterna, razonSocial }` con `null` cuando no hay dato.
 */
export const resolveRefExterna = ({ props = {}, search = "" } = {}) => {
  const fromWindow =
    typeof window !== "undefined"
      ? (window.__ONBOARDING_PSP_PROPS__ ?? {})
      : {};
  const params = new URLSearchParams(search);

  const refExterna =
    props.refExterna ?? fromWindow.refExterna ?? params.get("ref") ?? null;
  const razonSocial =
    props.razonSocial ??
    fromWindow.razonSocial ??
    params.get("razon_social") ??
    null;

  return { refExterna: refExterna ? String(refExterna) : null, razonSocial };
};
