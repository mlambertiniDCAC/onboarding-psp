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
  it("pide el draft a la ruta de onboarding con el form_type", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { data: { id: 1 } } });
    const store = makeStore();

    await store.dispatch(fetchCvuActivationStatus("7"));

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/v1/onboarding/compliance/7/drafts",
      { params: { form_type: "ALTA_CVU" } }
    );
  });

  it("rehidrata los documentos del step_2 con url y nombre", async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: {
        data: {
          id: 12,
          status: "EN_PROGRESO",
          completed_steps: ["step_0", "step_1"],
          form_values: {
            step_2: {
              estatuto_social: {
                documento: [
                  {
                    url: "https://s3/x/3f2a.pdf?sig",
                    nombre: "Estatuto año 2024.pdf",
                  },
                ],
              },
              acta_asamblea: { omitido: true, motivo: "no aplica" },
            },
          },
        },
      },
    });
    const store = makeStore();

    await store.dispatch(fetchCvuActivationStatus("7"));

    expect(store.getState().cvuActivation.stepData.step2.documents).toEqual({
      estatuto_social: {
        files: [
          { url: "https://s3/x/3f2a.pdf?sig", name: "Estatuto año 2024.pdf" },
        ],
        skipped: false,
        skipReason: "",
      },
      acta_asamblea: { files: [], skipped: true, skipReason: "no aplica" },
    });
  });

  it("un documento sin url queda con url null y su nombre", async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: {
        data: {
          id: 12,
          status: "EN_PROGRESO",
          completed_steps: ["step_0", "step_1"],
          form_values: {
            step_2: {
              estatuto_social: {
                documento: [{ url: null, nombre: "estatuto_social" }],
              },
            },
          },
        },
      },
    });
    const store = makeStore();

    await store.dispatch(fetchCvuActivationStatus("7"));

    expect(
      store.getState().cvuActivation.stepData.step2.documents.estatuto_social
        .files
    ).toEqual([{ url: null, name: "estatuto_social" }]);
  });
});
