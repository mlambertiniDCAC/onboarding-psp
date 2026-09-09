import { describe, it, expect, vi } from "vitest";
import { persistConfig } from "../store";

vi.mock("../../lib/axiosInstance", () => ({
  getAxiosInstance: async () => ({
    get: async () => ({ data: {} }),
    post: async () => ({ data: {} }),
    put: async () => ({ data: {} }),
  }),
  default: { get: async () => ({ data: {} }) },
}));

describe("store persist config", () => {
  it("persists only the profile slice (cvuActivation must stay in memory for the paso-2 File round-trip)", () => {
    expect(persistConfig.whitelist).toEqual(["profile"]);
  });
});
