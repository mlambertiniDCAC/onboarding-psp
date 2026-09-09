import {
  REGULATION_CONFIRMATION,
  REGULATION_TYPE,
} from "./personalInfoConstants";

/**
 * Mapea la selección local de regulaciones a los toggles que espera el back
 * en el draft del paso 1 PF. "none" (o vacío) resulta en ambos toggles false.
 */
export const regulationsToApiFlags = (regulations = []) => ({
  sujeto_obligado: regulations.includes(REGULATION_TYPE.OBLIGED_SUBJECT),
  persona_expuesta_politicamente: regulations.includes(
    REGULATION_TYPE.POLITICALLY_EXPOSED
  ),
});

/**
 * Inverso de `regulationsToApiFlags`: arma la selección local a partir de los
 * toggles guardados en el draft. Ambos false significa que el usuario eligió
 * "none" (el paso solo se guarda con una selección hecha).
 */
export const apiFlagsToRegulations = (apiFlags = {}) => {
  const regulations = [];
  if (apiFlags.sujeto_obligado) {
    regulations.push(REGULATION_TYPE.OBLIGED_SUBJECT);
  }
  if (apiFlags.persona_expuesta_politicamente) {
    regulations.push(REGULATION_TYPE.POLITICALLY_EXPOSED);
  }
  return regulations.length ? regulations : [REGULATION_TYPE.NONE];
};

export const normalizeRegulations = (regulations = []) => {
  if (!Array.isArray(regulations)) return [];

  return regulations.filter((value) =>
    Object.values(REGULATION_TYPE).includes(value)
  );
};

/**
 * Aplica la lógica de exclusión entre regulaciones:
 * - "none" es excluyente con las demás.
 * - Las otras pueden coexistir entre sí.
 */
export const toggleRegulationSelection = (
  currentRegulations,
  nextRegulations
) => {
  const toggledValue = nextRegulations.find(
    (value) => !currentRegulations.includes(value)
  );
  const removedValue = currentRegulations.find(
    (value) => !nextRegulations.includes(value)
  );
  const changedValue = toggledValue ?? removedValue;

  if (!changedValue) {
    return nextRegulations;
  }

  if (changedValue === REGULATION_TYPE.NONE) {
    return currentRegulations.includes(REGULATION_TYPE.NONE)
      ? []
      : [REGULATION_TYPE.NONE];
  }

  return nextRegulations.filter((value) => value !== REGULATION_TYPE.NONE);
};

/**
 * Devuelve la regulación que el usuario acaba de marcar (no desmarcar) y que
 * requiere confirmación vía modal (SO o PEP). Si el cambio no agrega una
 * regulación que requiera confirmación, devuelve null.
 */
export const getRegulationRequiringConfirmation = (
  currentRegulations = [],
  nextRegulations = []
) => {
  const addedValue = nextRegulations.find(
    (value) => !currentRegulations.includes(value)
  );

  if (addedValue && REGULATION_CONFIRMATION[addedValue]) {
    return addedValue;
  }

  return null;
};
