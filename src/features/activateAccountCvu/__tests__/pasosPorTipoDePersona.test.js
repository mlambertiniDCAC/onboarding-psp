import { describe, it, expect } from "vitest";
import {
  CVU_ACTIVATION_STEP,
  PERSON_TYPE,
  cvuActivationStepsByType,
  pasoAlcanzable,
  tieneDocumentacion,
} from "../lib/constants";

const idsDe = (type) => cvuActivationStepsByType(type).map((paso) => paso.id);

describe("tieneDocumentacion", () => {
  it("solo la persona juridica tiene paso de documentacion", () => {
    expect(tieneDocumentacion(PERSON_TYPE.PERSONA_JURIDICA)).toBe(true);
    expect(tieneDocumentacion(PERSON_TYPE.PERSONA_FISICA)).toBe(false);
  });
});

describe("cvuActivationStepsByType", () => {
  it("la persona fisica no ve el paso de documentacion", () => {
    expect(idsDe(PERSON_TYPE.PERSONA_FISICA)).toEqual([
      CVU_ACTIVATION_STEP.STEP_0,
      CVU_ACTIVATION_STEP.STEP_1,
      CVU_ACTIVATION_STEP.STEP_3,
    ]);
  });

  it("la persona juridica lo ve", () => {
    expect(idsDe(PERSON_TYPE.PERSONA_JURIDICA)).toEqual([
      CVU_ACTIVATION_STEP.STEP_0,
      CVU_ACTIVATION_STEP.STEP_1,
      CVU_ACTIVATION_STEP.STEP_2,
      CVU_ACTIVATION_STEP.STEP_3,
    ]);
  });

  it("sin tipo se comporta como persona fisica", () => {
    expect(idsDe(undefined)).not.toContain(CVU_ACTIVATION_STEP.STEP_2);
  });

  it("el paso 1 cambia de nombre segun el tipo", () => {
    const etiqueta = (type) =>
      cvuActivationStepsByType(type).find(
        (paso) => paso.id === CVU_ACTIVATION_STEP.STEP_1
      ).label;

    expect(etiqueta(PERSON_TYPE.PERSONA_FISICA)).toBe("Información personal");
    expect(etiqueta(PERSON_TYPE.PERSONA_JURIDICA)).toBe("Tipo de sociedad");
  });
});

describe("pasoAlcanzable", () => {
  it("a una persona fisica el paso 2 la manda a terminos y condiciones", () => {
    expect(
      pasoAlcanzable(CVU_ACTIVATION_STEP.STEP_2, PERSON_TYPE.PERSONA_FISICA)
    ).toBe(CVU_ACTIVATION_STEP.STEP_3);
  });

  it("a una persona juridica el paso 2 la deja donde estaba", () => {
    expect(
      pasoAlcanzable(CVU_ACTIVATION_STEP.STEP_2, PERSON_TYPE.PERSONA_JURIDICA)
    ).toBe(CVU_ACTIVATION_STEP.STEP_2);
  });

  it("no toca ningun otro paso", () => {
    for (const type of [
      PERSON_TYPE.PERSONA_FISICA,
      PERSON_TYPE.PERSONA_JURIDICA,
    ]) {
      for (const paso of [
        CVU_ACTIVATION_STEP.STEP_0,
        CVU_ACTIVATION_STEP.STEP_1,
        CVU_ACTIVATION_STEP.STEP_3,
      ]) {
        expect(pasoAlcanzable(paso, type)).toBe(paso);
      }
    }
  });

  it("todo paso devuelto es uno que esa persona puede ver", () => {
    for (const type of [
      PERSON_TYPE.PERSONA_FISICA,
      PERSON_TYPE.PERSONA_JURIDICA,
    ]) {
      const visibles = idsDe(type);
      for (const paso of Object.values(CVU_ACTIVATION_STEP)) {
        expect(visibles).toContain(pasoAlcanzable(paso, type));
      }
    }
  });
});
