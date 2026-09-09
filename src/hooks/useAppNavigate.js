import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const getBaseTrimmed = () => {
  const base = import.meta.env.BASE_URL;
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const shouldPassThroughString = (to) => {
  if (to === "." || to === ".." || to.startsWith("..")) {
    return true;
  }
  return /^(https?:|\/\/)/i.test(to);
};

/**
 * Rutas de la SPA que empiezan con "/" (p. ej. "/pagos") se resuelven bajo Vite
 * `import.meta.env.BASE_URL` ("/" o "/inicio/"). Query y hash se conservan.
 * Rutas relativas de react-router (sin "/" inicial, ".", "..") no se modifican.
 */
const resolveAppPathname = (pathname) => {
  if (!pathname.startsWith("/")) {
    return pathname;
  }

  const baseTrimmed = getBaseTrimmed();
  const withoutLeadingSlash = pathname.replace(/^\//, "");

  if (
    baseTrimmed &&
    (pathname === baseTrimmed || pathname.startsWith(`${baseTrimmed}/`))
  ) {
    return pathname;
  }

  return baseTrimmed
    ? `${baseTrimmed}/${withoutLeadingSlash}`
    : `/${withoutLeadingSlash}`;
};

const resolveStringTo = (to) => {
  if (shouldPassThroughString(to)) {
    return to;
  }
  if (!to.startsWith("/")) {
    return to;
  }

  const q = to.indexOf("?");
  const h = to.indexOf("#");
  let pathEnd = to.length;
  if (q >= 0) {
    pathEnd = Math.min(pathEnd, q);
  }
  if (h >= 0) {
    pathEnd = Math.min(pathEnd, h);
  }

  const pathPart = to.slice(0, pathEnd);
  const rest = to.slice(pathEnd);

  return `${resolveAppPathname(pathPart)}${rest}`;
};

const resolveObjectTo = (to) => {
  if (!to.pathname || !to.pathname.startsWith("/")) {
    return to;
  }

  return {
    ...to,
    pathname: resolveAppPathname(to.pathname),
  };
};

/**
 * Igual que `useNavigate` de react-router, pero las rutas absolutas (string u objeto
 * con `pathname`) se anteponen con `import.meta.env.BASE_URL`.
 */
export const useAppNavigate = () => {
  const navigate = useNavigate();

  return useCallback(
    (to, options) => {
      if (typeof to === "number") {
        navigate(to);
        return;
      }
      if (typeof to === "string") {
        navigate(resolveStringTo(to), options);
        return;
      }
      navigate(resolveObjectTo(to), options);
    },
    [navigate]
  );
};
