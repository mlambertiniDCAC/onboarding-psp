import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("../../../lib/authStorage", () => ({
  authStorage: {
    getToken: vi.fn(() => null),
    setToken: vi.fn(),
    clear: vi.fn(),
  },
}));

import { authStorage } from "../../../lib/authStorage";
import authReducer, { loginSuccess, loggedOut } from "../authSlice";

afterEach(() => {
  vi.clearAllMocks();
});

describe("authSlice", () => {
  it("starts with the token from storage", () => {
    expect(authReducer(undefined, { type: "@@init" }).token).toBeNull();
  });

  it("loginSuccess stores the token and fills scope/sujetos", () => {
    const state = authReducer(
      undefined,
      loginSuccess({
        token: "tkn",
        scope: "usuario",
        sujetos: [{ sujetoId: "1" }],
      })
    );
    expect(state.token).toBe("tkn");
    expect(state.scope).toBe("usuario");
    expect(state.sujetos).toEqual([{ sujetoId: "1" }]);
    expect(authStorage.setToken).toHaveBeenCalledWith("tkn");
  });

  it("loggedOut clears the token", () => {
    const loggedIn = authReducer(undefined, loginSuccess({ token: "tkn" }));
    const state = authReducer(loggedIn, loggedOut());
    expect(state.token).toBeNull();
    expect(authStorage.clear).toHaveBeenCalled();
  });
});
