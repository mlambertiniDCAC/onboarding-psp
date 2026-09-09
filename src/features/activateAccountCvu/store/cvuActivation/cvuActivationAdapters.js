import { CVU_ACTIVATION_STEP } from "../../lib/constants";
import { apiFlagsToRegulations } from "../../lib/regulationHelpers";

const VALID_STEPS = Object.values(CVU_ACTIVATION_STEP);
const STEP_KEY_PREFIX = "step_";

const stepKeyToNumber = (stepKey) =>
  Number(String(stepKey).replace(STEP_KEY_PREFIX, ""));

// El back marca los pasos ya guardados en `completed_steps` (ej. ["step_0"]).
// El paso a reanudar es el siguiente al último completado, acotado a los pasos
// válidos. Si no hay ninguno, o ya están todos, no forzamos navegación (null).
const deriveCurrentStep = (completedSteps = []) => {
  if (!completedSteps.length) return null;
  const maxCompleted = Math.max(...completedSteps.map(stepKeyToNumber));
  const nextStep = maxCompleted + 1;
  return VALID_STEPS.includes(nextStep) ? nextStep : null;
};

// Normaliza una entrada de documento del step_2 (`{ documento: [{ url, nombre }] }`
// o `{ omitido, motivo }`) al shape que consume la pantalla: descriptores
// `{ name, url }` que el InputFile rehidrata más el estado de omisión.
const adaptDocumentEntry = (entry = {}) => ({
  files: (entry.documento ?? []).map(({ url, nombre }) => ({
    url,
    name: nombre,
  })),
  skipped: Boolean(entry.omitido),
  skipReason: entry.motivo ?? "",
});

// Mapea los valores guardados por el back (`form_values`) al shape de `stepData`
// del slice. Solo se incluyen los pasos presentes para no pisar datos locales.
const adaptFormValuesToStepData = (formValues = {}) => {
  const stepData = {};
  if (formValues.step_0) {
    stepData.step0 = {
      legalCondition: formValues.step_0.condicion_legal ?? null,
    };
  }
  // El step_1 difiere por flujo: PJ guarda `tipo_societario`, PF `ocupacion`
  // más los toggles de regulaciones.
  if (formValues.step_1?.tipo_societario) {
    stepData.step1 = {
      societyType: formValues.step_1.tipo_societario,
    };
  }
  if (formValues.step_1?.ocupacion) {
    stepData.step1 = {
      occupation: formValues.step_1.ocupacion,
      regulations: apiFlagsToRegulations(formValues.step_1),
    };
  }
  // El step_2 llega como un mapa `{ <value>: entrada }`, donde cada entrada es o
  // bien `{ documento: [{ url, nombre }] }` (archivos ya subidos) o
  // `{ omitido: true, motivo }`. Se normaliza a descriptores `{ name, url }` que
  // el InputFile sabe rehidratar. Incluye tanto los documentos obligatorios como
  // los condicionales (apoderado/PEP), que comparten el mismo shape.
  if (formValues.step_2) {
    stepData.step2 = {
      documents: Object.entries(formValues.step_2).reduce(
        (acc, [value, entry]) => {
          acc[value] = adaptDocumentEntry(entry);
          return acc;
        },
        {}
      ),
    };
  }
  return stepData;
};

// Respuesta de GET /v1/compliance/:id/drafts?form_type=ALTA_CVU:
// { success, data: { status, completed_steps, form_values, ... } }
export const adaptRegistrationStatus = (response) => {
  const data = response?.data ?? {};
  return {
    currentStep: deriveCurrentStep(data.completed_steps),
    status: data.status ?? null,
    hasExistingDraft: Boolean(data.id),
    stepData: adaptFormValuesToStepData(data.form_values),
  };
};

// Extrae las opciones crudas de condición legal del paso 0.
// El back responde { success, data: { condicion_legal: { input_type, options } } }.
export const adaptLegalConditionOptions = (response) =>
  response?.data?.condicion_legal?.options ?? [];

// Extrae las opciones crudas de tipo societario del paso 1 (PJ).
// El back responde { success, data: { tipo_societario: { input_type, options } } }.
export const adaptSocietyTypeOptions = (response) =>
  response?.data?.tipo_societario?.options ?? [];

const CONDITIONAL_APODERADO_KEY = "condicional_apoderado";
const CONDITIONAL_PEP_KEY = "condicional_pep";

// Extrae la documentación del paso 2 (PJ). El back responde
// { success, data: { <tipo_societario>: { input_type, options }, condicional_apoderado, condicional_pep } }.
// La clave de los documentos obligatorios es el propio tipo societario consultado.
export const adaptDocumentationOptions = (response, societyType) => {
  const data = response?.data ?? {};
  const firstOption = (key) => data[key]?.options?.[0] ?? null;
  return {
    documents: data[societyType]?.options ?? [],
    apoderado: firstOption(CONDITIONAL_APODERADO_KEY),
    pep: firstOption(CONDITIONAL_PEP_KEY),
  };
};

// Extrae las opciones crudas de ocupación del paso 1 (PF).
// El back responde { success, data: { ocupacion: { input_type, options },
// sujeto_obligado: { input_type }, persona_expuesta_politicamente: { input_type } } }.
export const adaptOccupationOptions = (response) =>
  response?.data?.ocupacion?.options ?? [];

// Extrae la estructura del paso final (T&C). El back responde
// { success, data: { terminos_condiciones_aceptado: { input_type } } }.
// Hoy solo informa el tipo de input esperado ("toggle"); la copia legal es local.
export const adaptTermsOptions = (response) =>
  response?.data?.terminos_condiciones_aceptado?.input_type ?? null;
