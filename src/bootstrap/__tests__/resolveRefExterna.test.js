import { describe, it, expect, afterEach } from "vitest";
import { resolveRefExterna } from "../resolveRefExterna";

afterEach(() => {
  delete window.__ONBOARDING_PSP_PROPS__;
});

describe("resolveRefExterna", () => {
  it("prefers the explicit prop", () => {
    window.__ONBOARDING_PSP_PROPS__ = { refExterna: "win" };
    expect(
      resolveRefExterna({ props: { refExterna: 38513 }, search: "?ref=qs" })
        .refExterna
    ).toBe("38513");
  });

  it("falls back to window props", () => {
    window.__ONBOARDING_PSP_PROPS__ = {
      refExterna: "win",
      razonSocial: "ACME",
    };
    expect(resolveRefExterna({ search: "?ref=qs" })).toEqual({
      refExterna: "win",
      razonSocial: "ACME",
    });
  });

  it("falls back to the query param", () => {
    expect(resolveRefExterna({ search: "?ref=38513" }).refExterna).toBe(
      "38513"
    );
  });

  it("returns null when nothing provides it", () => {
    expect(resolveRefExterna({ search: "" }).refExterna).toBeNull();
  });
});
