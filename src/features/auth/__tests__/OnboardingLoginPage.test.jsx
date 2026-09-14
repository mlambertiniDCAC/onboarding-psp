import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { configureStore } from "@reduxjs/toolkit";
import { lightTheme } from "../../../assets/themes";
import profileReducer from "../../../slices/profile/profileSlice";
import { selectDefaultSocietyId } from "../../../slices/profile/profileSelectors";
import authReducer from "../authSlice";
import OnboardingLoginPage from "../OnboardingLoginPage";

afterEach(cleanup);

vi.mock("src/lib/axiosInstance", () => ({
  default: {
    post: () =>
      Promise.resolve({
        data: { token: "tkn", scope: "onboarding", sujetos: [] },
      }),
  },
}));

vi.mock("../../../lib/authStorage", () => ({
  authStorage: {
    getToken: () => null,
    getSujetoId: () => null,
    setToken: () => {},
    setSujetoId: () => {},
    clear: () => {},
  },
}));

const makeStore = () =>
  configureStore({
    reducer: { profile: profileReducer, auth: authReducer },
    middleware: (g) => g({ serializableCheck: false }),
  });

describe("OnboardingLoginPage", () => {
  it("setea profile.defaultSociety en el mismo submit que el login (sin esperar un render aparte)", async () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/?step=2&type=PJ"]}>
          <ThemeProvider theme={lightTheme}>
            <OnboardingLoginPage />
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );

    const mailInput = document.querySelector('input[name="mail"]');
    const sujetoInput = document.querySelector('input[name="sujetoId"]');
    fireEvent.change(mailInput, { target: { value: "op@psp.local" } });
    fireEvent.change(sujetoInput, { target: { value: "555555" } });
    fireEvent.click(screen.getByText(/Ingresar/i));

    await waitFor(() =>
      expect(store.getState().auth.token).toBe("tkn")
    );
    expect(selectDefaultSocietyId(store.getState())).toBe("555555");
  });
});
