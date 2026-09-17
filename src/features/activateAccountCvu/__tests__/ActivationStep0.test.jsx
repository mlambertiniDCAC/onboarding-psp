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
import { lightTheme } from "../../../assets/themes";
import { CVU_ACTIVATION_STEP } from "../lib/constants";

const get = vi.fn();
const post = vi.fn();
const put = vi.fn();

vi.mock("src/lib/axiosInstance", () => {
  const instance = {
    get: (...args) => get(...args),
    post: (...args) => post(...args),
    put: (...args) => put(...args),
  };
  return {
    default: instance,
    getAxiosInstance: async () => instance,
  };
});

const { default: cvuActivationReducer } = await import(
  "../store/cvuActivation/cvuActivationSlice"
);
const { ActivationStep0 } = await import(
  "../components/steps/step0/ActivationStep0"
);

const SOCIETY_ID = 333333;

const LEGAL_CONDITION_RESPONSE = {
  data: {
    data: {
      condicion_legal: {
        options: [{ value: "PF" }, { value: "PJ" }],
      },
    },
  },
};

const profileReducer = () => ({
  defaultSociety: { id: SOCIETY_ID, razon_social: "ACME S.A." },
});

const buildStore = ({ hasExistingDraft }) => {
  const initialCvuActivation = cvuActivationReducer(undefined, {
    type: "@@INIT",
  });
  return configureStore({
    reducer: { cvuActivation: cvuActivationReducer, profile: profileReducer },
    preloadedState: {
      cvuActivation: { ...initialCvuActivation, hasExistingDraft },
    },
  });
};

const renderStep0 = ({ hasExistingDraft = false } = {}) => {
  const onStepChange = vi.fn();
  render(
    <Provider store={buildStore({ hasExistingDraft })}>
      <ThemeProvider theme={lightTheme}>
        <ActivationStep0 onStepChange={onStepChange} />
      </ThemeProvider>
    </Provider>
  );
  return onStepChange;
};

const elegirYContinuar = async (label) => {
  await waitFor(() => expect(screen.getByText(label)).toBeTruthy());
  fireEvent.click(screen.getByText(label));
  fireEvent.click(screen.getByText("Siguiente"));
};

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  put.mockReset();
  get.mockResolvedValue(LEGAL_CONDITION_RESPONSE);
  post.mockResolvedValue({ data: { id: 1, form_type: "ALTA_CVU_PF" } });
});

afterEach(cleanup);

describe("ActivationStep0", () => {
  it("sin draft existente guarda la condición legal con POST y el flujo ALTA_CVU", async () => {
    const onStepChange = renderStep0();

    await elegirYContinuar("Persona Humana");

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(`/v1/compliance/${SOCIETY_ID}/draft`, {
        tipo_flujo: "ALTA_CVU",
        step: "step_0",
        value: { condicion_legal: "PF" },
      })
    );
    expect(put).not.toHaveBeenCalled();
    expect(onStepChange).toHaveBeenCalledWith(CVU_ACTIVATION_STEP.STEP_1, {
      type: "PF",
    });
  });

  it("con draft existente sigue usando POST con ALTA_CVU, no el PUT del subtipo", async () => {
    const onStepChange = renderStep0({ hasExistingDraft: true });

    await elegirYContinuar("Persona Humana");

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(`/v1/compliance/${SOCIETY_ID}/draft`, {
        tipo_flujo: "ALTA_CVU",
        step: "step_0",
        value: { condicion_legal: "PF" },
      })
    );
    expect(put).not.toHaveBeenCalled();
    expect(onStepChange).toHaveBeenCalledWith(CVU_ACTIVATION_STEP.STEP_1, {
      type: "PF",
    });
  });

  it("cambiar de PF a PJ con draft existente avanza al step_1 del flujo PJ", async () => {
    post.mockResolvedValue({ data: { id: 2, form_type: "ALTA_CVU_PJ" } });
    const onStepChange = renderStep0({ hasExistingDraft: true });

    await elegirYContinuar("Persona Jurídica");

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(`/v1/compliance/${SOCIETY_ID}/draft`, {
        tipo_flujo: "ALTA_CVU",
        step: "step_0",
        value: { condicion_legal: "PJ" },
      })
    );
    expect(put).not.toHaveBeenCalled();
    expect(onStepChange).toHaveBeenCalledWith(CVU_ACTIVATION_STEP.STEP_1, {
      type: "PJ",
    });
  });

  it("no avanza cuando el guardado falla", async () => {
    post.mockRejectedValue({ response: { data: { error: "boom" } } });
    const onStepChange = renderStep0({ hasExistingDraft: true });

    await elegirYContinuar("Persona Humana");

    await waitFor(() =>
      expect(
        screen.getByText(
          "No pudimos guardar la selección. Intentá nuevamente más tarde."
        )
      ).toBeTruthy()
    );
    expect(onStepChange).not.toHaveBeenCalled();
  });
});
