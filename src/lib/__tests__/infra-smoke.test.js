import { describe, it, expect } from "vitest";
import { adaptErrors, apiErrorBody } from "../helpers";
import { lightTheme, darkTheme, color } from "../../assets/themes";

describe("leaf infra imports", () => {
  it("adaptErrors flattens field errors", () => {
    expect(adaptErrors({ errors: { a: ["x"], b: ["y", "z"] } })).toEqual([
      "x",
      "y",
      "z",
    ]);
  });

  it("adaptErrors returns [message] when no field errors", () => {
    expect(adaptErrors({ message: "boom" })).toEqual(["boom"]);
  });

  it("apiErrorBody reads the perimeter error format", () => {
    const error = {
      response: {
        data: {
          error: { code: 400, message: "m", errors: { monto: ["x"] } },
        },
      },
    };
    expect(apiErrorBody(error)).toEqual({
      code: 400,
      message: "m",
      errors: { monto: ["x"] },
    });
    expect(adaptErrors(apiErrorBody(error))).toEqual(["x"]);
  });

  it("apiErrorBody falls back to the legacy body", () => {
    const error = { response: { data: { statusCode: 400, message: "m" } } };
    expect(adaptErrors(apiErrorBody(error))).toEqual(["m"]);
  });

  it("apiErrorBody is undefined without a response", () => {
    expect(apiErrorBody(new Error("Network Error"))).toBeUndefined();
    expect(adaptErrors(apiErrorBody(new Error("Network Error")))).toEqual([]);
  });

  it("themes expose a color palette", () => {
    expect(lightTheme.colors.neutral).toBeTruthy();
    expect(darkTheme.colors.neutral).toBeTruthy();
    expect(color.neutral).toBeTruthy();
  });
});
