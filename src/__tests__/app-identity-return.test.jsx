import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "../slices/profile/profileSlice";
import cvuActivationReducer from "../features/activateAccountCvu/store/cvuActivation/cvuActivationSlice";
import authReducer from "../features/auth/authSlice";
import App from "../App";

const get = vi.fn(async (url) => {
  if (url.includes("/estado")) return { data: { estado: "en_progreso" } };
  if (url.includes("/v1/identidad/me"))
    return { data: { validada: false, validacion_en_curso: true } };
  return { data: {} };
});

vi.mock("../lib/axiosInstance", () => ({
  getAxiosInstance: async () => ({
    get: async (url) => get(url),
    post: async () => ({ data: {} }),
    put: async () => ({ data: {} }),
  }),
  default: {
    get: async (url) => get(url),
    post: async () => ({ data: {} }),
    put: async () => ({ data: {} }),
  },
}));

vi.mock("../lib/authStorage", () => ({
  authStorage: {
    getToken: () => "tkn",
    getSujetoId: () => "38513",
    setToken: () => {},
    setSujetoId: () => {},
    clear: () => {},
  },
}));

const makeStore = () =>
  configureStore({
    reducer: {
      profile: profileReducer,
      cvuActivation: cvuActivationReducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        token: "tkn",
        sujetoId: "38513",
        scope: "onboarding",
        sujetos: [{ sujetoId: "38513", estado: "en_progreso" }],
      },
    },
    middleware: (g) => g({ serializableCheck: false }),
  });

const renderAt = (entry) =>
  render(
    <Provider store={makeStore()}>
      <MemoryRouter initialEntries={[entry]}>
        <App />
      </MemoryRouter>
    </Provider>
  );

afterEach(cleanup);

describe("App con el retorno de la validación de identidad en la URL", () => {
  it("cae en el paso de identidad aunque el step de la query sea el de 4i", async () => {
    renderAt(
      "/?type=PF&resultado=timeout&identidad_step=701&grupo=SESION_VENCIDA"
    );

    expect(await screen.findByText(/Validación de identidad/i)).toBeTruthy();
    expect(
      await screen.findByText(/venció antes de que la termines/i)
    ).toBeTruthy();
  });

  it("cae en el paso de identidad aunque el retorno llegue sin el tipo de persona", async () => {
    renderAt("/?resultado=exit&identidad_step=121&grupo=SALIDA_USUARIO");

    expect(await screen.findByText(/Validación de identidad/i)).toBeTruthy();
    expect(await screen.findByText(/Saliste de la validación/i)).toBeTruthy();
  });

  it("sin retorno en la query el wizard sigue decidiendo por step y type", async () => {
    renderAt("/");

    expect(await screen.findByText(/Activar mi cuenta CVU/i)).toBeTruthy();
    expect(screen.queryByText(/Validación de identidad/i)).toBeNull();
  });
});
