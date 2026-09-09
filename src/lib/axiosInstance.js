import axios from "axios";
import devAxiosInstance from "./devAxiosInstance";

const isDevStandalone =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_LOGIN === "true";

/**
 * Axios instance para el remote (dcpFront)
 * Importa y aplica el interceptor de autenticación del host (dcac)
 * usando Module Federation
 */

// Crear instancia de axios propia del remote
const axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_APIGW_PSP_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

let isInitialized = false;
let initializationPromise = null;

/**
 * Importa attachAuthInterceptor del host
 * Retorna null si no está disponible (fallback para desarrollo standalone)
 */
const getAuthInterceptor = async () => {
  try {
    // Importación dinámica del módulo expuesto por el host
    const module = await import("dcac/axiosInstance");

    // Verificar que la función esté disponible
    if (
      typeof (module?.default || module?.attachAuthInterceptor) === "function"
    ) {
      return module.default || module.attachAuthInterceptor;
    }

    console.warn(
      "[axiosInstance] attachAuthInterceptor no encontrado en el módulo del host"
    );
    return null;
  } catch (error) {
    // Fallback: el remote funciona sin auth si no puede conectar con el host
    // Útil para desarrollo standalone
    console.warn(
      "[axiosInstance] No se pudo cargar attachAuthInterceptor del host. " +
        "El remote funcionará sin autenticación.",
      error
    );
    return null;
  }
};

/**
 * Inicializa el interceptor de autenticación
 * Debe llamarse antes de usar axiosPublic
 */
const initAuthInterceptor = async () => {
  if (isDevStandalone || isInitialized) return;

  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        const attachAuthInterceptor = await getAuthInterceptor();

        if (attachAuthInterceptor) {
          // Aplicar el interceptor del host a nuestra instancia
          attachAuthInterceptor(axiosPublic);
          console.info(
            "[axiosInstance] Interceptor de autenticación aplicado desde el host"
          );
        } else {
          console.warn(
            "[axiosInstance] Funcionando sin interceptor de autenticación. " +
              "Asegúrate de que el host está disponible."
          );
        }
      } catch (error) {
        console.error(
          "[axiosInstance] Error inicializando interceptor de autenticación:",
          error
        );
      } finally {
        isInitialized = true;
      }
    })();
  }

  return initializationPromise;
};

/**
 * Obtiene la instancia de axios ya inicializada con el interceptor
 */
export const getAxiosInstance = async () => {
  if (isDevStandalone) return devAxiosInstance;

  await initAuthInterceptor();
  return axiosPublic;
};

// Auto-inicialización al importar el módulo
// Esto intenta aplicar el interceptor inmediatamente
if (!isDevStandalone) {
  initAuthInterceptor().catch(console.error);
}

export default isDevStandalone ? devAxiosInstance : axiosPublic;
