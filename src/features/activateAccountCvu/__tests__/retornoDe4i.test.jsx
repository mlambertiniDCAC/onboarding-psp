import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ThemeProvider } from "styled-components";
import { MemoryRouter } from "react-router-dom";
import { lightTheme } from "../../../assets/themes";

const get = vi.fn();
const post = vi.fn();
const put = vi.fn();

vi.mock("src/lib/axiosInstance", () => {
  const instance = {
    get: (...args) => get(...args),
    post: (...args) => post(...args),
    put: (...args) => put(...args),
  };
  return { default: instance, getAxiosInstance: async () => instance };
});

const { default: cvuActivationReducer } =
  await import("../store/cvuActivation/cvuActivationSlice");
const { default: ActivateAccountCvu } =
  await import("../pages/ActivateAccountCvu");

const SOCIETY_ID = 333333;
const DRAFTS_URL = `/v1/onboarding/compliance/${SOCIETY_ID}/drafts`;
const IDENTITY_ME_URL = "/v1/identidad/me";

const profileReducer = () => ({
  defaultSociety: { id: SOCIETY_ID, razon_social: "ACME S.A." },
});

const buildStore = () =>
  configureStore({
    reducer: { cvuActivation: cvuActivationReducer, profile: profileReducer },
  });

const mockBack = ({ completedSteps, identidadValidada }) => {
  get.mockImplementation((url) => {
    if (url === DRAFTS_URL) {
      return Promise.resolve({
        data: {
          data: {
            id: 1,
            completed_steps: completedSteps,
            form_values: {},
          },
        },
      });
    }
    if (url === IDENTITY_ME_URL) {
      return Promise.resolve({
        data: {
          validada: identidadValidada,
          validada_en: identidadValidada ? "2026-11-16T12:53:13Z" : null,
        },
      });
    }
    return Promise.resolve({ data: { data: {} } });
  });
};

const renderVolviendoDe4i = (entry) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Provider store={buildStore()}>
        <ThemeProvider theme={lightTheme}>
          <ActivateAccountCvu />
        </ThemeProvider>
      </Provider>
    </MemoryRouter>
  );

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  put.mockReset();
});

afterEach(cleanup);

describe("vuelta de 4i al wizard", () => {
  it("cae en el paso de identidad y no en el paso que trae el back", async () => {
    mockBack({
      completedSteps: ["step_0", "step_1", "step_2"],
      identidadValidada: true,
    });

    renderVolviendoDe4i("/?resultado=success");

    expect(await screen.findByText(/Validamos tu identidad/i)).toBeTruthy();
    await waitFor(() => expect(get).toHaveBeenCalledWith(IDENTITY_ME_URL));
    expect(screen.queryByText(/Enviar documentación/i)).toBeNull();
  });

  it("desde el resultado se puede seguir al paso de terminos y condiciones", async () => {
    mockBack({
      completedSteps: ["step_0", "step_1"],
      identidadValidada: true,
    });

    renderVolviendoDe4i("/?resultado=success");

    fireEvent.click(await screen.findByText(/^Siguiente$/i));

    expect(await screen.findByText(/Enviar documentación/i)).toBeTruthy();
  });

  it("sin retorno de 4i sigue reanudando en el paso que trae el back", async () => {
    mockBack({
      completedSteps: ["step_0", "step_1", "step_2"],
      identidadValidada: true,
    });

    renderVolviendoDe4i("/");

    expect(await screen.findByText(/Enviar documentación/i)).toBeTruthy();
  });
});
