import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "../../../assets/themes";
import CvuActivationIntro from "../components/CvuActivationIntro/CvuActivationIntro";
import { CVU_ACTIVATION_STEP } from "../lib/constants";

const post = vi.fn();

vi.mock("src/lib/axiosInstance", () => ({
  default: {
    post: (...args) => post(...args),
  },
}));

afterEach(cleanup);

const renderIntro = (onStepChange) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <CvuActivationIntro sujetoId="923326" onStepChange={onStepChange} />
    </ThemeProvider>
  );

describe("CvuActivationIntro", () => {
  it("activa el compliance y recién ahí avanza al step 0", async () => {
    post.mockResolvedValue({ data: { sujetoId: "923326", estado: "en_progreso" } });
    const onStepChange = vi.fn();
    renderIntro(onStepChange);

    fireEvent.click(screen.getByText("Activar mi cuenta CVU"));

    await waitFor(() =>
      expect(onStepChange).toHaveBeenCalledWith(CVU_ACTIVATION_STEP.STEP_0)
    );
    expect(post).toHaveBeenCalledWith("/v1/compliance/923326/iniciar");
  });

  it("no avanza y muestra el error cuando la activación falla", async () => {
    post.mockImplementation(() => Promise.reject(new Error("500")));
    const onStepChange = vi.fn();
    renderIntro(onStepChange);

    fireEvent.click(screen.getByText("Activar mi cuenta CVU"));

    await waitFor(() =>
      expect(
        screen.getByText(
          "No pudimos activar tu cuenta CVU. Probá de nuevo en unos minutos."
        )
      ).toBeTruthy()
    );
    expect(onStepChange).not.toHaveBeenCalled();
  });
});
