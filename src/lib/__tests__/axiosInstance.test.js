import { describe, it, expect } from "vitest";
import axiosInstance from "../axiosInstance";

const captureAdapter = (config) =>
  Promise.resolve({ data: null, status: 200, statusText: "OK", headers: {}, config });

const contentTypeOf = (config) => String(config.headers.getContentType() ?? "");

describe("axiosInstance", () => {
  it("envía un FormData tal cual, con sus archivos, sin forzar JSON", async () => {
    const file = new File(["contenido"], "contrato.pdf", { type: "application/pdf" });
    const formData = new FormData();
    formData.append("flujo", "ALTA_CVU_PJ");
    formData.append("step", "step_2");
    formData.append("archivos[contrato_social_privado][]", file);

    const { config } = await axiosInstance.put("/v1/compliance/1/draft", formData, {
      adapter: captureAdapter,
    });

    expect(config.data).toBe(formData);
    expect(config.data.get("archivos[contrato_social_privado][]")).toBeInstanceOf(File);
    expect(contentTypeOf(config)).not.toContain("application/json");
  });

  it("serializa los objetos como JSON", async () => {
    const payload = { flujo: "ALTA_CVU_PJ", step: "step_1", data: { tipo_societario: "SH" } };

    const { config } = await axiosInstance.put("/v1/compliance/1/draft", payload, {
      adapter: captureAdapter,
    });

    expect(config.data).toBe(JSON.stringify(payload));
    expect(contentTypeOf(config)).toContain("application/json");
  });
});
