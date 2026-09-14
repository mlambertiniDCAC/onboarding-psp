import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "../slices/profile/profileSlice";
import cvuActivationReducer from "../features/activateAccountCvu/store/cvuActivation/cvuActivationSlice";
import authReducer from "../features/auth/authSlice";
import App from "../App";

afterEach(cleanup);

vi.mock("../lib/axiosInstance", () => ({
  getAxiosInstance: async () => ({
    get: async (url) => {
      if (url.includes("/estado")) {
        return { data: { estado: "en_progreso" } };
      }
      return { data: {} };
    },
    post: async () => ({ data: {} }),
    put: async () => ({ data: {} }),
  }),
  default: {
    get: async (url) => {
      if (url.includes("/estado")) {
        return { data: { estado: "en_progreso" } };
      }
      return { data: {} };
    },
    post: async () =>
      Promise.resolve({
        data: { token: "tkn", scope: "onboarding", sujetos: [] },
      }),
  },
}));

vi.mock("../lib/authStorage", () => ({
  authStorage: {
    getToken: () => null,
    getSujetoId: () => null,
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
    middleware: (g) => g({ serializableCheck: false }),
  });

describe("App con una URL con step/type pegados de una sesión anterior", () => {
  it("limpia la URL al loguear y no salta directo a un paso del sujeto viejo", async () => {
    render(
      <Provider store={makeStore()}>
        <MemoryRouter initialEntries={["/?step=2&type=PJ"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );

    const mailInput = document.querySelector('input[name="mail"]');
    const sujetoInput = document.querySelector('input[name="sujetoId"]');
    fireEvent.change(mailInput, { target: { value: "op@psp.local" } });
    fireEvent.change(sujetoInput, { target: { value: "999888" } });
    fireEvent.click(screen.getByText(/Ingresar/i));

    await waitFor(() =>
      expect(screen.queryByText(/^Mail$/i)).toBeNull()
    );

    expect(
      screen.queryByText(/Activar mi cuenta CVU/i) ||
        screen.queryByText(/Usá deCampoaPagos/i)
    ).toBeTruthy();
    expect(screen.queryByText(/Documentación/i)).toBeNull();
  });
});
