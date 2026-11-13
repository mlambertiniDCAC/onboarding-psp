import { describe, it, expect } from "vitest";
import { resolveIdentityOutcome } from "../lib/identityOutcome";

describe("resolveIdentityOutcome", () => {
  it("gana el estado validado por encima de cualquier resultado de la query", () => {
    const outcome = resolveIdentityOutcome({
      resultado: "timeout",
      step: "701",
      estado: { validada: true, validada_en: "2026-11-12T10:00:00Z" },
    });

    expect(outcome.variant).toBe("success");
    expect(outcome.message).toMatch(/Validamos tu identidad/i);
    expect(outcome.canRetry).toBe(false);
  });

  it("un success que todavía no figura validado ofrece actualizar, no reintentar", () => {
    const outcome = resolveIdentityOutcome({
      resultado: "success",
      estado: { validada: false },
    });

    expect(outcome.canRefresh).toBe(true);
    expect(outcome.canRetry).toBe(false);
    expect(outcome.message).toMatch(/Actualizá el estado/i);
  });

  it("el grupo que manda el backend manda sobre el resultado genérico", () => {
    const outcome = resolveIdentityOutcome({
      resultado: "failed",
      step: "227",
      grupo: "PERMISO_CAMARA",
      estado: { validada: false },
    });

    expect(outcome.message).toMatch(/permiso de cámara/i);
    expect(outcome.canRetry).toBe(true);
  });

  it("dice cuántos minutos falta cuando el dispositivo quedó bloqueado", () => {
    const outcome = resolveIdentityOutcome({
      resultado: "failed",
      step: "9030",
      grupo: "DISPOSITIVO_BLOQUEADO",
      estado: { validada: false },
    });

    expect(outcome.message).toMatch(/en 30 minutos/i);
    expect(outcome.canRetry).toBe(false);
  });

  it("usa el singular con un minuto de bloqueo", () => {
    const outcome = resolveIdentityOutcome({
      resultado: "failed",
      step: "9001",
      grupo: "DISPOSITIVO_BLOQUEADO",
    });

    expect(outcome.message).toMatch(/en 1 minuto\./i);
  });

  it("sin grupo del backend cae en el mensaje del resultado, aunque haya step", () => {
    const outcome = resolveIdentityOutcome({
      resultado: "failed",
      step: "227",
      estado: { validada: false },
    });

    expect(outcome.message).not.toMatch(/permiso de cámara/i);
  });

  it("un grupo explícito en la query se respeta si lo conocemos", () => {
    const outcome = resolveIdentityOutcome({
      resultado: "failed",
      grupo: "DOCUMENTO_NO_VALIDO",
    });

    expect(outcome.message).toMatch(/No pudimos validar el documento/i);
  });

  it("un grupo que no conocemos no tapa al resultado", () => {
    const outcome = resolveIdentityOutcome({
      resultado: "timeout",
      grupo: "GRUPO_QUE_NO_EXISTE",
    });

    expect(outcome.message).toMatch(/venció antes de que la termines/i);
    expect(outcome.canRetry).toBe(true);
  });

  it("cubre los resultados nuestros y los de 4i", () => {
    expect(
      resolveIdentityOutcome({ resultado: "review_needed" }).message
    ).toMatch(/revisión manual/i);
    expect(resolveIdentityOutcome({ resultado: "exit" }).message).toMatch(
      /Saliste de la validación/i
    );
    expect(resolveIdentityOutcome({ resultado: "error" }).message).toMatch(
      /Hubo un problema/i
    );
    expect(
      resolveIdentityOutcome({ resultado: "bad_request" }).message
    ).toMatch(/No pudimos arrancar bien la validación/i);
    expect(resolveIdentityOutcome({ resultado: "pendiente" }).canRefresh).toBe(
      true
    );
    expect(resolveIdentityOutcome({ resultado: "expirada" }).message).toMatch(
      /enlace de validación venció/i
    );
    expect(
      resolveIdentityOutcome({ resultado: "ya_consumida" }).message
    ).toMatch(/ya estaba cerrada/i);
    expect(
      resolveIdentityOutcome({ resultado: "no_encontrada" }).message
    ).toMatch(/No encontramos esa validación/i);
  });

  it("un resultado que no está en la lista cae en el mensaje genérico", () => {
    const outcome = resolveIdentityOutcome({
      resultado: "resultado_nuevo_de_4i",
    });

    expect(outcome.message).toMatch(/No pudimos interpretar el resultado/i);
    expect(outcome.canRetry).toBe(true);
  });

  it("el desconocido que manda el gateway cae en el mismo mensaje genérico", () => {
    expect(
      resolveIdentityOutcome({ resultado: "desconocido" }).message
    ).toMatch(/No pudimos interpretar el resultado/i);
  });

  it("no rompe sin ningún dato", () => {
    expect(resolveIdentityOutcome().message).toMatch(
      /No pudimos interpretar el resultado/i
    );
  });

  it("un review_needed no ofrece ninguna acción", () => {
    const outcome = resolveIdentityOutcome({ resultado: "review_needed" });

    expect(outcome.canRetry).toBe(false);
    expect(outcome.canRefresh).toBe(false);
  });
});
