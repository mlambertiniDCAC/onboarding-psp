import { describe, it, expect } from "vitest";
import {
  CVU_ACTIVATION_STEP,
  PERSON_TYPE,
  cvuActivationStepsByType,
  etiquetaDelPaso2,
  tieneDocumentacion,
  validaIdentidadEnElWizard,
} from "../lib/constants";

const pasosDe = (type) => cvuActivationStepsByType(type);
const idsDe = (type) => pasosDe(type).map((paso) => paso.id);
const etiquetaDe = (type, id) =>
  pasosDe(type).find((paso) => paso.id === id).label;

describe("quien carga documentacion y quien valida identidad", () => {
  it("la documentacion es solo de la persona juridica", () => {
    expect(tieneDocumentacion(PERSON_TYPE.PERSONA_JURIDICA)).toBe(true);
    expect(tieneDocumentacion(PERSON_TYPE.PERSONA_FISICA)).toBe(false);
  });

  it("la identidad se valida dentro del wizard solo para la persona fisica", () => {
    expect(validaIdentidadEnElWizard(PERSON_TYPE.PERSONA_FISICA)).toBe(true);
    expect(validaIdentidadEnElWizard(PERSON_TYPE.PERSONA_JURIDICA)).toBe(false);
  });

  it("son excluyentes: el paso 2 es una cosa o la otra", () => {
    for (const type of Object.values(PERSON_TYPE)) {
      expect(tieneDocumentacion(type)).not.toBe(
        validaIdentidadEnElWizard(type)
      );
    }
  });
});

describe("cvuActivationStepsByType", () => {
  it("los dos tipos recorren los mismos cuatro pasos", () => {
    const esperado = [
      CVU_ACTIVATION_STEP.STEP_0,
      CVU_ACTIVATION_STEP.STEP_1,
      CVU_ACTIVATION_STEP.STEP_2,
      CVU_ACTIVATION_STEP.STEP_3,
    ];

    expect(idsDe(PERSON_TYPE.PERSONA_FISICA)).toEqual(esperado);
    expect(idsDe(PERSON_TYPE.PERSONA_JURIDICA)).toEqual(esperado);
  });

  it("el paso 2 se llama distinto segun el tipo", () => {
    expect(
      etiquetaDe(PERSON_TYPE.PERSONA_FISICA, CVU_ACTIVATION_STEP.STEP_2)
    ).toBe("Validación de identidad");
    expect(
      etiquetaDe(PERSON_TYPE.PERSONA_JURIDICA, CVU_ACTIVATION_STEP.STEP_2)
    ).toBe("Documentación");
  });

  it("el paso 1 tambien", () => {
    expect(
      etiquetaDe(PERSON_TYPE.PERSONA_FISICA, CVU_ACTIVATION_STEP.STEP_1)
    ).toBe("Información personal");
    expect(
      etiquetaDe(PERSON_TYPE.PERSONA_JURIDICA, CVU_ACTIVATION_STEP.STEP_1)
    ).toBe("Tipo de sociedad");
  });

  it("sin tipo se comporta como persona fisica", () => {
    expect(etiquetaDelPaso2(undefined)).toBe("Validación de identidad");
    expect(idsDe(undefined)).toEqual(idsDe(PERSON_TYPE.PERSONA_FISICA));
  });

  it("ningun paso queda sin nombre", () => {
    for (const type of Object.values(PERSON_TYPE)) {
      for (const paso of pasosDe(type)) {
        expect(typeof paso.label).toBe("string");
        expect(paso.label.trim()).not.toBe("");
      }
    }
  });
});
