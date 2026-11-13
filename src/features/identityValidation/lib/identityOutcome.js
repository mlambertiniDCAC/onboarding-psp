import { IDENTITY_RESULT, IDENTITY_STEP_GROUP } from "./constants";
import { blockedMinutesOfStep, knownGroup } from "./stepGroups";

const outcome = (variant, message, actions = {}) => ({
  variant,
  message,
  canRetry: actions.canRetry ?? false,
  canRefresh: actions.canRefresh ?? false,
});

const esperaDeBloqueo = (minutos) => {
  if (minutos === null || minutos <= 0) return "en unos minutos";
  return minutos === 1 ? "en 1 minuto" : `en ${minutos} minutos`;
};

const MENSAJE_SALIDA =
  "Saliste de la validación antes de terminarla. Podés volver a intentar cuando quieras.";

const MENSAJE_SESION_VENCIDA =
  "La validación venció antes de que la termines. Volvé a iniciarla y completala sin cerrar la pestaña.";

const MENSAJE_ERROR_SISTEMA =
  "Hubo un problema durante la validación. Esperá unos minutos y volvé a intentar.";

const GROUP_OUTCOMES = {
  [IDENTITY_STEP_GROUP.DISPOSITIVO_BLOQUEADO]: (step) =>
    outcome(
      "warning",
      `Por varios intentos fallidos quedó bloqueado el dispositivo. Vas a poder volver a validar tu identidad ${esperaDeBloqueo(
        blockedMinutesOfStep(step)
      )}.`
    ),
  [IDENTITY_STEP_GROUP.DOCUMENTO_NO_VALIDO]: () =>
    outcome(
      "danger",
      "No pudimos validar el documento. Revisá que sea tu DNI vigente y que las fotos salgan completas, nítidas y sin reflejos, y volvé a intentar.",
      { canRetry: true }
    ),
  [IDENTITY_STEP_GROUP.CANT_MAX_INTENTOS]: () =>
    outcome(
      "warning",
      "Llegaste a la cantidad máxima de intentos. Esperá un rato antes de volver a intentar; si sigue sin salir, escribile al equipo de soporte.",
      { canRetry: true }
    ),
  [IDENTITY_STEP_GROUP.SESION_VENCIDA]: () =>
    outcome("warning", MENSAJE_SESION_VENCIDA, { canRetry: true }),
  [IDENTITY_STEP_GROUP.PERMISO_CAMARA]: () =>
    outcome(
      "warning",
      "No pudimos usar la cámara del dispositivo. Habilitá el permiso de cámara en el navegador y volvé a intentar.",
      { canRetry: true }
    ),
  [IDENTITY_STEP_GROUP.DISPOSITIVO_NO_COMPATIBLE]: () =>
    outcome(
      "danger",
      "Este dispositivo o navegador no es compatible con la validación. Entrá desde un celular con cámara, con el navegador actualizado, y volvé a intentar.",
      { canRetry: true }
    ),
  [IDENTITY_STEP_GROUP.SALIDA_USUARIO]: () =>
    outcome("info", MENSAJE_SALIDA, { canRetry: true }),
  [IDENTITY_STEP_GROUP.ERROR_SISTEMA]: () =>
    outcome("danger", MENSAJE_ERROR_SISTEMA, { canRetry: true }),
};

const RESULT_OUTCOMES = {
  [IDENTITY_RESULT.FAILED]: outcome(
    "danger",
    "La validación de identidad no se completó. Volvé a intentar con buena luz y el documento a mano.",
    { canRetry: true }
  ),
  [IDENTITY_RESULT.REVIEW_NEEDED]: outcome(
    "info",
    "Tu validación quedó en revisión manual. No hace falta que la repitas: te avisamos cuando tengamos el resultado."
  ),
  [IDENTITY_RESULT.EXIT]: outcome("info", MENSAJE_SALIDA, { canRetry: true }),
  [IDENTITY_RESULT.TIMEOUT]: outcome("warning", MENSAJE_SESION_VENCIDA, {
    canRetry: true,
  }),
  [IDENTITY_RESULT.ERROR]: outcome("danger", MENSAJE_ERROR_SISTEMA, {
    canRetry: true,
  }),
  [IDENTITY_RESULT.BAD_REQUEST]: outcome(
    "danger",
    "No pudimos arrancar bien la validación. Volvé a intentar; si sigue igual, escribile al equipo de soporte.",
    { canRetry: true }
  ),
  [IDENTITY_RESULT.PENDIENTE]: outcome(
    "info",
    "Todavía estamos esperando el resultado de la validación. Actualizá el estado en unos segundos.",
    { canRefresh: true }
  ),
  [IDENTITY_RESULT.EXPIRADA]: outcome(
    "warning",
    "El enlace de validación venció. Iniciá una validación nueva para continuar.",
    { canRetry: true }
  ),
  [IDENTITY_RESULT.YA_CONSUMIDA]: outcome(
    "info",
    "Esa validación ya estaba cerrada y tu identidad todavía figura sin validar. Iniciá una nueva para continuar.",
    { canRetry: true }
  ),
  [IDENTITY_RESULT.NO_ENCONTRADA]: outcome(
    "danger",
    "No encontramos esa validación. Iniciá una nueva para continuar.",
    { canRetry: true }
  ),
};

const UNKNOWN_OUTCOME = outcome(
  "danger",
  "No pudimos interpretar el resultado de la validación. Volvé a intentar.",
  { canRetry: true }
);

const VALIDATED_OUTCOME = outcome(
  "success",
  "Validamos tu identidad. Ya podés continuar con el siguiente paso."
);

const PENDING_CONFIRMATION_OUTCOME = outcome(
  "info",
  "Terminaste la validación y todavía estamos confirmando el resultado. Actualizá el estado en unos segundos.",
  { canRefresh: true }
);

const normalizarResultado = (resultado) =>
  typeof resultado === "string" ? resultado.trim().toLowerCase() : "";

export const resolveIdentityOutcome = ({
  resultado,
  step,
  grupo,
  estado,
} = {}) => {
  if (estado?.validada) return VALIDATED_OUTCOME;

  const resultadoNormalizado = normalizarResultado(resultado);
  if (resultadoNormalizado === IDENTITY_RESULT.SUCCESS)
    return PENDING_CONFIRMATION_OUTCOME;

  const grupoEfectivo = knownGroup(grupo);
  const porGrupo = GROUP_OUTCOMES[grupoEfectivo];
  if (porGrupo) return porGrupo(step);

  return RESULT_OUTCOMES[resultadoNormalizado] ?? UNKNOWN_OUTCOME;
};
