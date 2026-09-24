import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAxiosInstance } from "src/lib/axiosInstance";
import { adaptErrors, apiErrorBody } from "src/lib/helpers";
import {
  CVU_ACTIVATION_STEP,
  CVU_FORM_TYPE,
  CVU_FLOW_PARAM_BY_PERSON,
} from "../../lib/constants";
import {
  adaptRegistrationStatus,
  adaptLegalConditionOptions,
  adaptSocietyTypeOptions,
  adaptDocumentationOptions,
  adaptOccupationOptions,
  adaptTermsOptions,
} from "./cvuActivationAdapters";

const axiosInstance = await getAxiosInstance();

const DRAFT_NOT_FOUND_STATUS = 404;

export const fetchCvuActivationStatus = createAsyncThunk(
  "cvuActivation/fetchStatus",
  async (societyId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/v1/compliance/${societyId}/drafts`,
        {
          params: { form_type: CVU_FORM_TYPE },
        }
      );
      return adaptRegistrationStatus(response.data);
    } catch (error) {
      if (error.response?.status === DRAFT_NOT_FOUND_STATUS) {
        return adaptRegistrationStatus(null);
      }
      return rejectWithValue(adaptErrors(apiErrorBody(error)));
    }
  }
);

export const fetchLegalConditionStep = createAsyncThunk(
  "cvuActivation/fetchLegalConditionStep",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/v1/compliance/steps", {
        params: {
          flujo: "alta_cvu",
          step: CVU_ACTIVATION_STEP.STEP_0,
        },
      });
      return adaptLegalConditionOptions(response.data);
    } catch (error) {
      return rejectWithValue(adaptErrors(apiErrorBody(error)));
    }
  }
);

export const fetchSocietyTypeStep = createAsyncThunk(
  "cvuActivation/fetchSocietyTypeStep",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/v1/compliance/steps", {
        params: {
          flujo: "alta_cvu_pj",
          step: CVU_ACTIVATION_STEP.STEP_1,
        },
      });
      return adaptSocietyTypeOptions(response.data);
    } catch (error) {
      return rejectWithValue(adaptErrors(apiErrorBody(error)));
    }
  }
);

// Trae la documentación societaria a cargar en el paso 2 según el tipo de sociedad
// elegido en el paso 1. El back responde las opciones por tipo societario más la
// documentación condicional (apoderado / PEP).
export const fetchDocumentationStep = createAsyncThunk(
  "cvuActivation/fetchDocumentationStep",
  async (societyType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/v1/compliance/steps", {
        params: {
          flujo: "alta_cvu_pj",
          step: CVU_ACTIVATION_STEP.STEP_2,
          tipo_societario: societyType,
        },
      });
      return adaptDocumentationOptions(response.data, societyType);
    } catch (error) {
      return rejectWithValue(adaptErrors(apiErrorBody(error)));
    }
  }
);

export const fetchPersonalInfoStep = createAsyncThunk(
  "cvuActivation/fetchPersonalInfoStep",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/v1/compliance/steps", {
        params: {
          flujo: "alta_cvu_pf",
          step: CVU_ACTIVATION_STEP.STEP_1,
        },
      });
      return adaptOccupationOptions(response.data);
    } catch (error) {
      return rejectWithValue(adaptErrors(apiErrorBody(error)));
    }
  }
);

// Trae la estructura del paso final (T&C) según el tipo de persona. El back
// responde el tipo de input esperado para la aceptación (flujo=alta_cvu_pf|pj).
export const fetchTermsStep = createAsyncThunk(
  "cvuActivation/fetchTermsStep",
  async (personType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/v1/compliance/steps", {
        params: {
          flujo: CVU_FLOW_PARAM_BY_PERSON[personType],
          step: CVU_ACTIVATION_STEP.STEP_3,
        },
      });
      return adaptTermsOptions(response.data);
    } catch (error) {
      return rejectWithValue(adaptErrors(apiErrorBody(error)));
    }
  }
);

// `step` es numérico (CVU_ACTIVATION_STEP) y el back lo espera como "step_N".
const toStepKey = (step) => `step_${step}`;

// Actualiza (PUT) un draft ya existente, del step_1 en adelante: el flujo va con
// el subtipo concreto (ALTA_CVU_PF/PJ), que es como están registrados esos pasos
// en el back. El step_0 no pasa por acá, usa `createDraft`.
// OJO: el contrato del PUT difiere del POST → usa `flujo` y `data`.
//
// Acepta dos formas de payload según el paso:
//   - JSON (pasos 1/final): se pasa `tipoFlujo`/`step`/`value` y se arma
//     { flujo, step, data }. El paso final (T&C) manda `stepKey: "step_final"`
//     para sobrescribir la key derivada de `step` (que daría "step_3").
//   - multipart (paso 2, documentación): se pasa un `formData` ya armado (ver
//     `buildDocumentationFormData`) y se envía tal cual. axios setea el boundary
//     del multipart automáticamente al detectar un FormData.
export const saveDraftStep = createAsyncThunk(
  "cvuActivation/saveDraftStep",
  async (
    { societyId, tipoFlujo, step, stepKey, value, formData },
    { rejectWithValue }
  ) => {
    try {
      const payload = formData ?? {
        flujo: tipoFlujo,
        step: stepKey ?? toStepKey(step),
        data: value,
      };
      const response = await axiosInstance.put(
        `/v1/compliance/${societyId}/draft`,
        payload
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(adaptErrors(apiErrorBody(error)));
    }
  }
);

// Crea (POST) o retoma el draft del paso 0. El paso 0 siempre va por acá con el
// flujo genérico ALTA_CVU: es el único camino que vincula el compliance al draft.
// Los pasos siguientes se guardan con `saveDraftStep` (PUT). OJO: el contrato del
// POST difiere del PUT → usa `tipo_flujo` y `value`.
export const createDraft = createAsyncThunk(
  "cvuActivation/createDraft",
  async ({ societyId, tipoFlujo, step, value }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/v1/compliance/${societyId}/draft`,
        {
          tipo_flujo: tipoFlujo,
          step: toStepKey(step),
          value,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(adaptErrors(apiErrorBody(error)));
    }
  }
);
