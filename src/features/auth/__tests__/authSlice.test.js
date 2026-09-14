import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("../../../lib/authStorage", () => ({
  authStorage: {
    getToken: vi.fn(() => null),
    setToken: vi.fn(),
    getSujetoId: vi.fn(() => null),
    setSujetoId: vi.fn(),
    clear: vi.fn(),
  },
}));

import { authStorage } from "../../../lib/authStorage";
import authReducer, { loginSuccess, loggedOut } from "../authSlice";

afterEach(() => {
  vi.clearAllMocks();
});

describe("authSlice", () => {
  it("starts with no token and no sujetoId", () => {
    const state = authReducer(undefined, { type: "@@init" });
    expect(state.token).toBeNull();
    expect(state.sujetoId).toBeNull();
  });

  it("loginSuccess stores the token/sujetoId and fills scope/sujetos", () => {
    const state = authReducer(
      undefined,
      loginSuccess({
        token: "tkn",
        sujetoId: "1",
        scope: "onboarding",
        sujetos: [{ sujetoId: "1", estado: "en_progreso" }],
      })
    );
    expect(state.token).toBe("tkn");
    expect(state.sujetoId).toBe("1");
    expect(state.scope).toBe("onboarding");
    expect(state.sujetos).toEqual([{ sujetoId: "1", estado: "en_progreso" }]);
    expect(authStorage.setToken).toHaveBeenCalledWith("tkn");
    expect(authStorage.setSujetoId).toHaveBeenCalledWith("1");
  });

  it("loggedOut clears the token and sujetoId", () => {
    const loggedIn = authReducer(
      undefined,
      loginSuccess({ token: "tkn", sujetoId: "1" })
    );
    const state = authReducer(loggedIn, loggedOut());
    expect(state.token).toBeNull();
    expect(state.sujetoId).toBeNull();
    expect(authStorage.clear).toHaveBeenCalled();
  });
});
