export const IDENTITY_ME_PATH = "/v1/identidad/me";

export const IDENTITY_VALIDATE_PATH = "/v1/identidad/validar";

export const RESULT_QUERY_PARAM = "resultado";

export const IDENTITY_SCREEN_QUERY_PARAM = "identidad";

export const RETURN_STEP_QUERY_PARAM = "identidad_step";

export const RETURN_GROUP_QUERY_PARAM = "grupo";

export const IDENTITY_RESULT = {
  SUCCESS: "success",
  FAILED: "failed",
  REVIEW_NEEDED: "review_needed",
  EXIT: "exit",
  TIMEOUT: "timeout",
  ERROR: "error",
  BAD_REQUEST: "bad_request",
  PENDIENTE: "pendiente",
  EXPIRADA: "expirada",
  YA_CONSUMIDA: "ya_consumida",
  NO_ENCONTRADA: "no_encontrada",
  DESCONOCIDO: "desconocido",
};

export const IDENTITY_STEP_GROUP = {
  DOCUMENTO_NO_VALIDO: "DOCUMENTO_NO_VALIDO",
  CANT_MAX_INTENTOS: "CANT_MAX_INTENTOS",
  SESION_VENCIDA: "SESION_VENCIDA",
  PERMISO_CAMARA: "PERMISO_CAMARA",
  DISPOSITIVO_NO_COMPATIBLE: "DISPOSITIVO_NO_COMPATIBLE",
  SALIDA_USUARIO: "SALIDA_USUARIO",
  ERROR_SISTEMA: "ERROR_SISTEMA",
  DISPOSITIVO_BLOQUEADO: "DISPOSITIVO_BLOQUEADO",
  SIN_GRUPO: "SIN_GRUPO",
};

export const DEVICE_BLOCK_STEP_MIN = 9000;

export const DEVICE_BLOCK_STEP_MAX = 9999;
