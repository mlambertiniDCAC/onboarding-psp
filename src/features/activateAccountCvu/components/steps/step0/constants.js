import { PERSON_TYPE } from "src/features/activateAccountCvu/lib/constants";

// Detalle visual (label + descripción) por condición legal.
// El back sólo provee value/label; mantenemos la copy local para el UI de cards.
export const LEGAL_CONDITION_DETAILS = {
  [PERSON_TYPE.PERSONA_FISICA]: {
    label: "Persona Humana",
    description:
      "Particulares, profesionales independientes o trabajadores autónomos.",
  },
  [PERSON_TYPE.PERSONA_JURIDICA]: {
    label: "Persona Jurídica",
    description:
      "Sociedades comerciales (S.A., S.R.L.), organizaciones sin fines de lucro o sociedades de hecho.",
  },
};

// Mergea cada opción de la respuesta con su detalle local según la key (value).
// El back define value, orden y disponibilidad; el front aporta label y
// descripción. Si el back trae un value desconocido, queda el label del back.
export const mergeLegalConditionOptions = (options = []) =>
  options.map((option) => ({
    ...option,
    ...LEGAL_CONDITION_DETAILS[option.value],
  }));
