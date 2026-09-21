import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { configureStore } from "@reduxjs/toolkit";
import { lightTheme } from "../../../assets/themes";
import profileReducer from "../../../slices/profile/profileSlice";
import { selectDefaultSocietyId } from "../../../slices/profile/profileSelectors";
import authReducer from "../authSlice";
import OnboardingLoginPage, {
  MENSAJE_REGISTRO_NO_HABILITADO,
} from "../OnboardingLoginPage";

afterEach(cleanup);

const { post } = vi.hoisted(() => ({
  post: vi.fn(() =>
    Promise.resolve({
      data: { token: "tkn", scope: "onboarding", sujetos: [] },
    })
  ),
}));

vi.mock("src/lib/axiosInstance", () => ({
  default: { post },
}));

vi.mock("../../../lib/authStorage", () => ({
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
    reducer: { profile: profileReducer, auth: authReducer },
    middleware: (g) => g({ serializableCheck: false }),
  });

const renderPage = (store) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?step=2&type=PJ"]}>
        <ThemeProvider theme={lightTheme}>
          <OnboardingLoginPage />
        </ThemeProvider>
      </MemoryRouter>
    </Provider>
  );

const enviar = (mail, sujetoId) => {
  fireEvent.change(document.querySelector('input[name="mail"]'), {
    target: { value: mail },
  });
  fireEvent.change(document.querySelector('input[name="sujetoId"]'), {
    target: { value: sujetoId },
  });
  fireEvent.click(screen.getByText(/Ingresar/i));
};

describe("OnboardingLoginPage", () => {
  it("setea profile.defaultSociety en el mismo submit que el login (sin esperar un render aparte)", async () => {
    const store = makeStore();
    renderPage(store);

    enviar("op@psp.local", "555555");

    await waitFor(() =>
      expect(store.getState().auth.token).toBe("tkn")
    );
    expect(selectDefaultSocietyId(store.getState())).toBe("555555");
  });

  it("guarda todas las sociedades que devuelve el registro y opera sobre la ingresada", async () => {
    post.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          token: "tkn-2",
          scope: "onboarding",
          sujetos: [
            { sujetoId: "111111", estado: "aceptado" },
            { sujetoId: "222222", estado: "sin_solicitud" },
          ],
        },
      })
    );
    const store = makeStore();
    renderPage(store);

    enviar("cliente@psp.local", "222222");

    await waitFor(() => expect(store.getState().auth.token).toBe("tkn-2"));
    expect(store.getState().auth.scope).toBe("onboarding");
    expect(store.getState().auth.sujetos).toHaveLength(2);
    expect(store.getState().auth.sujetoId).toBe("222222");
    expect(selectDefaultSocietyId(store.getState())).toBe("222222");
  });

  it("muestra un mensaje propio y no abre sesión cuando el registro responde 403", async () => {
    post.mockImplementationOnce(() =>
      Promise.reject({
        response: {
          status: 403,
          data: { message: "este mail no puede registrarse por esta vía" },
        },
      })
    );
    const store = makeStore();
    renderPage(store);

    enviar("admin@psp.local", "999999");

    expect(
      await screen.findByText(MENSAJE_REGISTRO_NO_HABILITADO)
    ).toBeTruthy();
    expect(store.getState().auth.token).toBeNull();
    expect(selectDefaultSocietyId(store.getState())).not.toBe("999999");
    expect(screen.getByText(/Ingresar/i).closest("button").disabled).toBe(
      false
    );
  });

  it("muestra el mensaje del gateway para otros errores", async () => {
    post.mockImplementationOnce(() =>
      Promise.reject({
        response: { status: 400, data: { message: "falta sujetoId" } },
      })
    );
    renderPage(makeStore());

    enviar("op@psp.local", "555555");

    expect(await screen.findByText("falta sujetoId")).toBeTruthy();
  });
});
