import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { lightTheme } from "../../../assets/themes";
import ComplianceStatusGate from "../ComplianceStatusGate";

afterEach(cleanup);

vi.mock("src/lib/axiosInstance", () => {
  const state = { estado: "en_progreso" };
  return {
    __setEstado: (e) => {
      state.estado = e;
    },
    default: {
      get: () => Promise.resolve({ data: { sujetoId: "1", estado: state.estado } }),
    },
  };
});

const renderGate = async (sujetoId, initialEntries = ["/"]) => {
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider theme={lightTheme}>
        <ComplianceStatusGate sujetoId={sujetoId}>
          <div>contenido del wizard</div>
        </ComplianceStatusGate>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe("ComplianceStatusGate", () => {
  it("bloquea con el aviso cuando el estado es en_revision", async () => {
    const axiosInstance = await import("src/lib/axiosInstance");
    axiosInstance.__setEstado("en_revision");

    await renderGate("333333");

    expect(
      await screen.findByText(/Tiene un compliance en revisión/i)
    ).toBeTruthy();
    expect(screen.queryByText(/contenido del wizard/i)).toBeNull();
  });

  it("deja pasar al wizard cuando el estado es en_progreso", async () => {
    const axiosInstance = await import("src/lib/axiosInstance");
    axiosInstance.__setEstado("en_progreso");

    await renderGate("777001");

    expect(await screen.findByText(/contenido del wizard/i)).toBeTruthy();
  });

  it("deja pasar al wizard cuando el estado es sin_solicitud", async () => {
    const axiosInstance = await import("src/lib/axiosInstance");
    axiosInstance.__setEstado("sin_solicitud");

    await renderGate("999999");

    expect(await screen.findByText(/contenido del wizard/i)).toBeTruthy();
  });

  it("re-chequea al cambiar de paso y bloquea si mientras tanto pasó a en_revision", async () => {
    const axiosInstance = await import("src/lib/axiosInstance");
    axiosInstance.__setEstado("en_progreso");

    const Harness = () => {
      const [searchParams, setSearchParams] = useSearchParams();
      return (
        <>
          <button
            type="button"
            onClick={() => setSearchParams({ step: "2" })}
          >
            ir al paso 2
          </button>
          <ComplianceStatusGate sujetoId="444444">
            <div>contenido del wizard</div>
          </ComplianceStatusGate>
        </>
      );
    };

    render(
      <MemoryRouter initialEntries={["/?step=3"]}>
        <ThemeProvider theme={lightTheme}>
          <Harness />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/contenido del wizard/i)).toBeTruthy();

    axiosInstance.__setEstado("en_revision");
    fireEvent.click(screen.getByText(/ir al paso 2/i));

    expect(
      await screen.findByText(/Tiene un compliance en revisión/i)
    ).toBeTruthy();
  });
});
