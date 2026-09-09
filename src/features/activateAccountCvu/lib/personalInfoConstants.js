export const REGULATION_TYPE = {
  OBLIGED_SUBJECT: "obliged_subject",
  POLITICALLY_EXPOSED: "politically_exposed",
  NONE: "none",
};

export const REGULATION_OPTIONS = [
  {
    value: REGULATION_TYPE.OBLIGED_SUBJECT,
    label: "Sujeto obligado",
    description:
      "Persona que debe informar operaciones sospechosas de lavado de activos o financiamiento del terrorismo.",
  },
  {
    value: REGULATION_TYPE.POLITICALLY_EXPOSED,
    label: "Persona Expuesta Políticamente",
    description:
      "Tiene o tuvo un cargo jerárquico dentro del gobierno o es familiar de un funcionario público.",
  },
  {
    value: REGULATION_TYPE.NONE,
    label: "Ninguna de las dos anteriores",
  },
];

/**
 * Pregunta del modal de confirmación que se dispara al marcar SO o PEP.
 * Las regulaciones que no figuran acá no requieren confirmación.
 */
export const REGULATION_CONFIRMATION = {
  [REGULATION_TYPE.OBLIGED_SUBJECT]:
    "¿Sos una persona que debe informar operaciones sospechosas de lavado de activos o financiamiento del terrorismo?",
  [REGULATION_TYPE.POLITICALLY_EXPOSED]:
    "¿Tenés o tuviste un cargo en el gobierno o sos familiar de alguien que desarrolla funciones públicas?",
};
