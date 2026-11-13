import {
  DEVICE_BLOCK_STEP_MAX,
  DEVICE_BLOCK_STEP_MIN,
  IDENTITY_STEP_GROUP,
} from "./constants";

const stepAsNumber = (step) => {
  if (step === null || step === undefined) return null;
  const texto = String(step).trim();
  if (!/^\d{1,10}$/.test(texto)) return null;
  return Number(texto);
};

const isBlockedDeviceStep = (numero) =>
  numero !== null &&
  numero >= DEVICE_BLOCK_STEP_MIN &&
  numero <= DEVICE_BLOCK_STEP_MAX;

export const blockedMinutesOfStep = (step) => {
  const numero = stepAsNumber(step);
  if (!isBlockedDeviceStep(numero)) return null;
  return numero - DEVICE_BLOCK_STEP_MIN;
};

export const knownGroup = (grupo) => {
  const texto = typeof grupo === "string" ? grupo.trim().toUpperCase() : "";
  return Object.values(IDENTITY_STEP_GROUP).includes(texto) ? texto : null;
};
