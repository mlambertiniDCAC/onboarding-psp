import axios from "axios";

// Variables de entorno de dcp-frontend
const baseUrl = import.meta.env.VITE_APIGW_PSP_URL || "";

// Funciones de storage para auth
const authStorage = {
  getToken: () =>
    localStorage.getItem("tt") ||
    new URLSearchParams(window.location.search).get("token"),
  getRefreshToken: () =>
    localStorage.getItem("refresh_token") ||
    new URLSearchParams(window.location.search).get("refresh_token"),
  getUser: () => localStorage.getItem("user"),
  setSession: ({ token, refreshToken }) => {
    if (token) localStorage.setItem("tt", token);
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
  },
  clear: () => localStorage.clear(),
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

export const axiosPublic = axios.create({
  baseURL: baseUrl,
});

// Replicamos el attachAuthInterceptor de web-cliente-react
export const attachAuthInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      config.headers = config.headers || {};
      const token = authStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const refreshToken = authStorage.getRefreshToken();
      const user = authStorage.getUser();

      // Sin sesión → logout
      if (!refreshToken || !user) {
        authStorage.clear();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // Refresh flow
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          try {
            const token = await new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await axios.post(`${baseUrl}/v1/auth/login/renew`, {
            uuid: user,
            refresh_token: refreshToken,
          });

          const newToken = response.data?.token;
          const newRefresh = response.data?.refresh_token;

          authStorage.setSession({
            token: newToken,
            refreshToken: newRefresh,
          });

          processQueue(null, newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (err) {
          processQueue(err, null);
          authStorage.clear();
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

// Adjuntamos el interceptor a la instancia principal
attachAuthInterceptor(axiosPublic);

export default axiosPublic;
