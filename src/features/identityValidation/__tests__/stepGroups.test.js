import { describe, expect, it } from "vitest";
import { blockedMinutesOfStep, knownGroup } from "../lib/stepGroups";
import { IDENTITY_STEP_GROUP } from "../lib/constants";

describe("blockedMinutesOfStep", () => {
  it("deriva los minutos del rango de bloqueo", () => {
    expect(blockedMinutesOfStep("9000")).toBe(0);
    expect(blockedMinutesOfStep("9005")).toBe(5);
    expect(blockedMinutesOfStep("9999")).toBe(999);
  });

  it("devuelve null fuera del rango o ante un step que no es numero", () => {
    expect(blockedMinutesOfStep("8999")).toBeNull();
    expect(blockedMinutesOfStep("10000")).toBeNull();
    expect(blockedMinutesOfStep("701")).toBeNull();
    expect(blockedMinutesOfStep("rm -rf /")).toBeNull();
    expect(blockedMinutesOfStep(null)).toBeNull();
    expect(blockedMinutesOfStep(undefined)).toBeNull();
  });
});

describe("knownGroup", () => {
  it("acepta los grupos del catalogo del backend sin importar mayusculas ni espacios", () => {
    expect(knownGroup("SALIDA_USUARIO")).toBe(
      IDENTITY_STEP_GROUP.SALIDA_USUARIO
    );
    expect(knownGroup("  sesion_vencida  ")).toBe(
      IDENTITY_STEP_GROUP.SESION_VENCIDA
    );
  });

  it("descarta lo que no es un grupo conocido", () => {
    expect(knownGroup("INVENTADO")).toBeNull();
    expect(knownGroup("https://otro.sitio/?x=1")).toBeNull();
    expect(knownGroup(null)).toBeNull();
    expect(knownGroup(42)).toBeNull();
  });
});
