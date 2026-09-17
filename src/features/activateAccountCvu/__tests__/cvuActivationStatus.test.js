import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import axiosInstance from "src/lib/axiosInstance";
import cvuActivationReducer from "../store/cvuActivation/cvuActivationSlice";
import { fetchCvuActivationStatus } from "../store/cvuActivation/cvuActivationActions";

vi.mock("src/lib/axiosInstance", () => {
  const mockAxios = {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
  };
  return { default: mockAxios, getAxiosInstance: async () => mockAxios };
});

const makeStore = () =>
  configureStore({
    reducer: { cvuActivation: cvuActivationReducer },
    middleware: (g) => g({ serializableCheck: false }),
  });

const httpError = (status, data) => ({ response: { status, data } });

describe("fetchCvuActivationStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trata el 404 del primer ingreso como sujeto sin draft, no como error", async () => {
    axiosInstance.get.mockRejectedValueOnce(
      httpError(404, {
        statusCode: 404,
        message:
          "No existe un draft activo para el sujeto verificado 7 y tipo ALTA_CVU",
      })
    );
    const store = makeStore();

    const result = await store.dispatch(fetchCvuActivationStatus("7"));

    expect(result.type).toBe("cvuActivation/fetchStatus/fulfilled");
    const state = store.getState().cvuActivation;
    expect(state.error).toBeNull();
    expect(state.hasExistingDraft).toBe(false);
    expect(state.registrationStatus).toEqual({
      currentStep: null,
      status: null,
    });
    expect(state.stepData).toEqual({
      step0: null,
      step1: null,
      step2: null,
      step3: null,
    });
    expect(state.isFetchingStatus).toBe(false);
  });

  it("carga el error con el message del gateway cuando el back falla", async () => {
    axiosInstance.get.mockRejectedValueOnce(
      httpError(500, {
        statusCode: 500,
        message: "compliance: el servicio respondió 500",
      })
    );
    const store = makeStore();

    const result = await store.dispatch(fetchCvuActivationStatus("7"));

    expect(result.type).toBe("cvuActivation/fetchStatus/rejected");
    const state = store.getState().cvuActivation;
    expect(state.error).toEqual(["compliance: el servicio respondió 500"]);
    expect(state.hasExistingDraft).toBe(false);
    expect(state.isFetchingStatus).toBe(false);
  });

  it("retoma en el paso siguiente al último completado cuando hay draft guardado", async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: {
        data: {
          id: 12,
          status: "EN_PROGRESO",
          completed_steps: ["step_0"],
          form_values: { step_0: { condicion_legal: "PF" } },
        },
      },
    });
    const store = makeStore();

    await store.dispatch(fetchCvuActivationStatus("7"));

    const state = store.getState().cvuActivation;
    expect(state.error).toBeNull();
    expect(state.hasExistingDraft).toBe(true);
    expect(state.registrationStatus).toEqual({
      currentStep: 1,
      status: "EN_PROGRESO",
    });
    expect(state.stepData.step0).toEqual({ legalCondition: "PF" });
  });
});
