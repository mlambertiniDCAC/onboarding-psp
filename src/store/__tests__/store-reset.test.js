import { describe, it, expect, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "../../slices/profile/profileSlice";
import cvuActivationReducer from "../../features/activateAccountCvu/store/cvuActivation/cvuActivationSlice";
import authReducer, {
  loginSuccess,
  loggedOut,
} from "../../features/auth/authSlice";
import { setStepData } from "../../features/activateAccountCvu/store/cvuActivation/cvuActivationSlice";

vi.mock("../../lib/axiosInstance", () => ({
  getAxiosInstance: async () => ({
    get: async () => ({ data: {} }),
    post: async () => ({ data: {} }),
    put: async () => ({ data: {} }),
  }),
  default: { get: async () => ({ data: {} }) },
}));

vi.mock("../../lib/authStorage", () => ({
  authStorage: {
    getToken: () => null,
    getSujetoId: () => null,
    setToken: () => {},
    setSujetoId: () => {},
    clear: () => {},
  },
}));

const buildAppReducer = (state, action) => ({
  profile: profileReducer(state?.profile, action),
  cvuActivation: cvuActivationReducer(state?.cvuActivation, action),
  auth: authReducer(state?.auth, action),
});

const rootReducer = (state, action) => {
  if (action.type === loginSuccess.type || action.type === loggedOut.type) {
    state = state && { ...state, cvuActivation: undefined };
  }
  return buildAppReducer(state, action);
};

const makeStore = () => configureStore({ reducer: rootReducer });

describe("root reducer reset on login/logout", () => {
  it("limpia cvuActivation al loguear con otro sujeto (no arrastra el step del sujeto anterior)", () => {
    const store = makeStore();
    store.dispatch(setStepData({ step: 0, data: { condicionLegal: "PF" } }));
    expect(store.getState().cvuActivation.stepData.step0).toEqual({
      condicionLegal: "PF",
    });

    store.dispatch(loginSuccess({ token: "t2", sujetoId: "999" }));

    expect(store.getState().cvuActivation.stepData.step0).toBeNull();
  });

  it("limpia cvuActivation al cerrar sesión", () => {
    const store = makeStore();
    store.dispatch(setStepData({ step: 0, data: { condicionLegal: "PJ" } }));

    store.dispatch(loggedOut());

    expect(store.getState().cvuActivation.stepData.step0).toBeNull();
  });
});
