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
    getToken: () => "test-token",
    setToken: () => {},
    clear: () => {},
  },
}));

const makeStore = () =>
  configureStore({
    reducer: {
      profile: profileReducer,
      cvuActivation: cvuActivationReducer,
      auth: authReducer,
    },
    middleware: (g) => g({ serializableCheck: false }),
  });

const renderAt = (initialEntries) =>
  render(
    <Provider store={makeStore()}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </Provider>
  );

describe("App mount", () => {
  it("asks for the sujetoId with no ref and no manual entry", async () => {
    renderAt(["/"]);
    expect(
      await screen.findByText(/Ingresá el sujetoId de la sociedad/i)
    ).toBeTruthy();
  });

  it("mounts the wizard intro when ?ref= is present", async () => {
    renderAt(["/?ref=38513"]);
    expect(await screen.findByText(/Activar mi cuenta CVU/i)).toBeTruthy();
  });
});
