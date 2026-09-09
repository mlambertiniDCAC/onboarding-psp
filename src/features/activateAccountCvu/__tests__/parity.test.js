import { describe, it, expect, vi } from "vitest";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import cvuReducer from "../store/cvuActivation/cvuActivationSlice";
import ActivateAccountCvu from "../pages/ActivateAccountCvu";

vi.mock("../../../lib/axiosInstance", () => ({
  getAxiosInstance: async () => ({
    get: async () => ({ data: {} }),
    post: async () => ({ data: {} }),
    put: async () => ({ data: {} }),
  }),
  default: { get: async () => ({ data: {} }) },
}));

const refDir = "../dcp-frontend/src/features/activateAccountCvu";
const refExists = existsSync(refDir);

describe("feature copy", () => {
  it.skipIf(!refExists)("is byte-identical to dcp-frontend", () => {
    const out = execSync(
      `diff -r --exclude=__tests__ ${refDir} src/features/activateAccountCvu || true`,
      { encoding: "utf8" }
    );
    expect(out.trim()).toBe("");
  });

  it("the reducer and page module resolve", () => {
    expect(typeof cvuReducer).toBe("function");
    expect(ActivateAccountCvu).toBeTruthy();
    const state = cvuReducer(undefined, { type: "@@init" });
    expect(state.stepData).toEqual({
      step0: null,
      step1: null,
      step2: null,
      step3: null,
    });
  });
});
