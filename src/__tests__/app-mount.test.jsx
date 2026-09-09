import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "../slices/profile/profileSlice";
import cvuActivationReducer from "../features/activateAccountCvu/store/cvuActivation/cvuActivationSlice";
import App from "../App";

vi.mock("../lib/axiosInstance", () => ({
  getAxiosInstance: async () => ({
    get: async () => ({ data: {} }),
    post: async () => ({ data: {} }),
    put: async () => ({ data: {} }),
  }),
  default: { get: async () => ({ data: {} }) },
}));

const makeStore = () =>
  configureStore({
    reducer: { profile: profileReducer, cvuActivation: cvuActivationReducer },
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
  it("shows the missing-id notice with no ref", async () => {
    renderAt(["/"]);
    expect(
      await screen.findByText(/Falta el identificador del sujeto/i)
    ).toBeTruthy();
  });

  it("mounts the wizard intro when ?ref= is present", async () => {
    renderAt(["/?ref=38513"]);
    expect(await screen.findByText(/Activar mi cuenta CVU/i)).toBeTruthy();
  });
});
