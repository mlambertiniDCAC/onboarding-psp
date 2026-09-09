export const CVU_ACTIVATION_STEP = {
  STEP_0: 0,
  STEP_1: 1,
  STEP_2: 2,
  STEP_3: 3,
};

// form_type del GET /drafts (query param). Es distinto del `flujo` del body.
export const CVU_FORM_TYPE = "ALTA_CVU";

// Tipos de flujo válidos para el `flujo`/`tipo_flujo` del body (POST/PUT draft).
export const CVU_FLOW_TYPE = {
  PF: "ALTA_CVU_PF",
  PJ: "ALTA_CVU_PJ",
  COMPLIANCE: "ALTA_COMPLIANCE",
};

export const PERSON_TYPE = {
  PERSONA_FISICA: "PF",
  PERSONA_JURIDICA: "PJ",
};

// Flujo (body) que corresponde a la condición legal elegida en el paso 0.
export const CVU_FLOW_TYPE_BY_PERSON = {
  [PERSON_TYPE.PERSONA_FISICA]: CVU_FLOW_TYPE.PF,
  [PERSON_TYPE.PERSONA_JURIDICA]: CVU_FLOW_TYPE.PJ,
};

// `flujo` del query param del GET /v1/compliance/steps (en minúscula, distinto
// del `flujo` del body que va en mayúscula — ver CVU_FLOW_TYPE_BY_PERSON).
export const CVU_FLOW_PARAM_BY_PERSON = {
  [PERSON_TYPE.PERSONA_FISICA]: "alta_cvu_pf",
  [PERSON_TYPE.PERSONA_JURIDICA]: "alta_cvu_pj",
};

// El último paso (T&C) se guarda en el draft con la key `step_final`, no `step_3`.
export const CVU_FINAL_STEP_KEY = "step_final";

export const STEP_QUERY_PARAM = "step";

export const TYPE_QUERY_PARAM = "type";

const VALID_PERSON_TYPES = Object.values(PERSON_TYPE);

export const parsePersonTypeFromUrl = (searchParams) => {
  const raw = searchParams.get(TYPE_QUERY_PARAM);
  return VALID_PERSON_TYPES.includes(raw) ? raw : null;
};

export const cvuActivationStepsByType = (type = PERSON_TYPE.PERSONA_FISICA) => {
  return [
    {
      id: CVU_ACTIVATION_STEP.STEP_0,
      label: "Condición Legal",
    },
    {
      id: CVU_ACTIVATION_STEP.STEP_1,
      label:
        type === PERSON_TYPE.PERSONA_FISICA
          ? "Información personal"
          : "Tipo de sociedad",
    },
    { id: CVU_ACTIVATION_STEP.STEP_2, label: "Documentación" },
    { id: CVU_ACTIVATION_STEP.STEP_3, label: "Términos y condiciones" },
  ];
};

export const BENEFITS = [
  {
    id: "cvu",
    pre: "",
    em: "CVU propio ",
    post: "para transferencias",
  },
  {
    id: "transfer",
    pre: "",
    em: "Enviá y recibí ",
    post: "dinero al instante",
  },
  {
    id: "services",
    pre: "Pagá todos tus ",
    em: "servicios e impuestos",
    post: " desde un solo lugar",
  },
  {
    id: "returns",
    pre: "",
    em: "Generá rendimientos",
    post: " todos los días con tu saldo",
  },
];
