import { describe, it, expect } from "vitest";
import reducer, { setDefaultSociety } from "../profileSlice";
import {
  selectDefaultSocietyId,
  selectDefaultSociety,
} from "../profileSelectors";

describe("profile slice", () => {
  it("setDefaultSociety stores the society and selectors read it back", () => {
    const next = reducer(
      undefined,
      setDefaultSociety({ id: "38513", razon_social: "ACME SA" })
    );
    const state = { profile: next };
    expect(selectDefaultSocietyId(state)).toBe("38513");
    expect(selectDefaultSociety(state).razon_social).toBe("ACME SA");
  });

  it("has a null defaultSociety by default", () => {
    const state = { profile: reducer(undefined, { type: "@@init" }) };
    expect(selectDefaultSocietyId(state)).toBeUndefined();
  });
});
