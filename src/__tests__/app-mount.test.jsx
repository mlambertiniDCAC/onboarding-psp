import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "../slices/profile/profileSlice";
import cvuActivationReducer from "../features/activateAccountCvu/store/cvuActivation/cvuActivationSlice";
import authReducer from "../features/auth/authSlice";
import App from "../App";

vi.mock("../lib/axiosInstance", () => ({
  getAxiosInstance: async () => ({
    get: async () => ({ data: {} }),
    post: async () => ({ data: {} }),
    put: async () => ({ data: {} }),
  }),
  default: {
    get: async () => ({ data: {} }),
    post: async () => ({ data: {} }),
  },
}));

vi.mock("../lib/authStorage", () => ({
  authStorage: {
    getToken: () => null,
    getSujetoId: () => null,
    setToken: () => {},
    setSujetoId: () => {},
    clear: () => {},
  },
}));

const makeStore = (preloadedAuth) =>
  configureStore({
    reducer: {
      profile: profileReducer,
      cvuActivation: cvuActivationReducer,
      auth: authReducer,
    },
    preloadedState: preloadedAuth ? { auth: preloadedAuth } : undefined,
    middleware: (g) => g({ serializableCheck: false }),
  });

const renderWith = (preloadedAuth) =>
  render(
    <Provider store={makeStore(preloadedAuth)}>
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    </Provider>
  );

describe("App mount", () => {
  it("shows the login screen (mail + Sociedad_ID) with no session", async () => {
    renderWith(null);
    expect(await screen.findByText(/^Mail$/i)).toBeTruthy();
    expect(await screen.findByText(/^Sociedad_ID$/i)).toBeTruthy();
  });

  it("mounts the wizard intro with an active session", async () => {
    renderWith({
      token: "test-token",
      sujetoId: "38513",
      scope: "onboarding",
      sujetos: [{ sujetoId: "38513", estado: "en_progreso" }],
    });
    expect(await screen.findByText(/Activar mi cuenta CVU/i)).toBeTruthy();
  });
});
