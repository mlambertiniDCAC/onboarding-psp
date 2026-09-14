import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import { configureStore } from "@reduxjs/toolkit";
import { lightTheme } from "../../../assets/themes";
import cvuActivationReducer from "../../activateAccountCvu/store/cvuActivation/cvuActivationSlice";
import IdentityValidationStep from "../IdentityValidationStep";

vi.mock("src/lib/axiosInstance", () => {
  const mockAxios = {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn((url) => {
      if (url.endsWith("/validacion-identidad/iniciar")) {
        return Promise.resolve({
          data: {
            data: {
              external_id: "ext-1",
              user_token: "mock-token",
              service_url: "mock://4i-validation",
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    }),
    put: vi.fn(() => Promise.resolve({ data: {} })),
  };
  return { default: mockAxios, getAxiosInstance: async () => mockAxios };
});

const makeStore = () =>
  configureStore({
    reducer: { cvuActivation: cvuActivationReducer },
    middleware: (g) => g({ serializableCheck: false }),
  });

afterEach(cleanup);

describe("IdentityValidationStep", () => {
  it("inicia la validación y muestra el aviso de entorno mock", async () => {
    render(
      <Provider store={makeStore()}>
        <ThemeProvider theme={lightTheme}>
          <IdentityValidationStep
            sujetoId="38513"
            onDone={vi.fn()}
            onPrevious={vi.fn()}
          />
        </ThemeProvider>
      </Provider>
    );

    expect(
      await screen.findByText(/entorno de prueba/i)
    ).toBeTruthy();
  });

  it("llama a onDone al confirmar en modo mock", async () => {
    const onDone = vi.fn();
    render(
      <Provider store={makeStore()}>
        <ThemeProvider theme={lightTheme}>
          <IdentityValidationStep
            sujetoId="38513"
            onDone={onDone}
            onPrevious={vi.fn()}
          />
        </ThemeProvider>
      </Provider>
    );

    const button = await screen.findByText(/Continuar \(mock\)/i);
    fireEvent.click(button);

    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });
});
