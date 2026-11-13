import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { lightTheme } from "../../../assets/themes";
import IdentityValidationStep from "../IdentityValidationStep";
import axiosInstance from "src/lib/axiosInstance";

vi.mock("src/lib/axiosInstance", () => {
  const mockAxios = {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
  };
  return { default: mockAxios, getAxiosInstance: async () => mockAxios };
});

const mockEstado = (...estados) => {
  const cola = [...estados];
  axiosInstance.get.mockImplementation(() =>
    Promise.resolve({
      data: cola.length > 1 ? cola.shift() : cola[0],
    })
  );
};

const mockValidar = (data) =>
  axiosInstance.post.mockImplementation(() => Promise.resolve({ data }));

const mockValidarFalla = (status) =>
  axiosInstance.post.mockImplementation(() =>
    Promise.reject(
      status ? { response: { status } } : new Error("sin respuesta")
    )
  );

const stubAssign = () => {
  const assign = vi.fn();
  vi.stubGlobal("location", { ...window.location, assign });
  return assign;
};

const renderStep = (entry = "/?step=2&type=PF", props = {}) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <ThemeProvider theme={lightTheme}>
        <IdentityValidationStep
          onDone={props.onDone ?? vi.fn()}
          onPrevious={props.onPrevious ?? vi.fn()}
        />
      </ThemeProvider>
    </MemoryRouter>
  );

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("IdentityValidationStep", () => {
  it("consulta el estado de la identidad al montar", async () => {
    mockEstado({ validada: false, validacion_en_curso: false });

    renderStep();

    await waitFor(() =>
      expect(axiosInstance.get).toHaveBeenCalledWith("/v1/identidad/me")
    );
    expect(await screen.findByText(/Validar mi identidad/i)).toBeTruthy();
  });

  it("no inicia una validación si la identidad ya está validada", async () => {
    mockEstado({ validada: true, validada_en: "2026-11-10T12:00:00Z" });
    const postsAntes = axiosInstance.post.mock.calls.length;

    renderStep();

    expect(await screen.findByText(/Validamos tu identidad/i)).toBeTruthy();
    expect(await screen.findByText(/^Siguiente$/i)).toBeTruthy();
    expect(axiosInstance.post.mock.calls.length).toBe(postsAntes);
  });

  it("navega a la URL de 4i, sin pestaña nueva ni confirmación manual", async () => {
    mockEstado({ validada: false, validacion_en_curso: false });
    mockValidar({
      usuario_sub: "sub-1",
      validacion_id: 77,
      url_4i: "https://admin.4i4id.com/webapp-citizens/t/abc",
    });
    const assign = stubAssign();
    const postsAntes = axiosInstance.post.mock.calls.length;

    renderStep();

    fireEvent.click(await screen.findByText(/Validar mi identidad/i));

    await waitFor(() =>
      expect(axiosInstance.post.mock.calls.length).toBe(postsAntes + 1)
    );
    expect(axiosInstance.post.mock.calls[postsAntes]).toEqual([
      "/v1/identidad/validar",
      {},
    ]);
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(
        "https://admin.4i4id.com/webapp-citizens/t/abc"
      )
    );
    expect(screen.queryByText(/Ya completé la validación/i)).toBeNull();
    expect(document.querySelector('a[target="_blank"]')).toBeNull();
  });

  it("habilita continuar cuando vuelve con resultado success y el backend lo confirma", async () => {
    mockEstado({ validada: true, validada_en: "2026-11-12T10:00:00Z" });
    const onDone = vi.fn();

    renderStep("/?type=PF&resultado=success", { onDone });

    fireEvent.click(await screen.findByText(/^Siguiente$/i));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });

  it("si el backend todavía no confirma el success ofrece actualizar el estado", async () => {
    mockEstado(
      { validada: false, validacion_en_curso: true },
      { validada: true }
    );

    renderStep("/?type=PF&resultado=success");

    fireEvent.click(await screen.findByText(/Actualizar estado/i));

    expect(await screen.findByText(/Validamos tu identidad/i)).toBeTruthy();
  });

  it("limpia el retorno de la query y deja la pantalla de identidad", async () => {
    mockEstado({ validada: true });

    const UrlProbe = () => {
      const [searchParams] = useSearchParams();
      return <span data-testid="url">{searchParams.toString()}</span>;
    };

    render(
      <MemoryRouter
        initialEntries={["/?resultado=success&identidad_step=701&grupo=X"]}
      >
        <ThemeProvider theme={lightTheme}>
          <UrlProbe />
          <IdentityValidationStep onDone={vi.fn()} onPrevious={vi.fn()} />
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByTestId("url").textContent).toBe("identidad=1")
    );
    expect(await screen.findByText(/Validamos tu identidad/i)).toBeTruthy();
  });

  it("explica el bloqueo del dispositivo con los minutos y no ofrece reintentar", async () => {
    mockEstado({ validada: false, validacion_en_curso: false });

    renderStep(
      "/?type=PF&resultado=failed&identidad_step=9030&grupo=DISPOSITIVO_BLOQUEADO"
    );

    expect(await screen.findByText(/en 30 minutos/i)).toBeTruthy();
    expect(screen.queryByText(/Reintentar/i)).toBeNull();
    expect(screen.queryByText(/Validar mi identidad/i)).toBeNull();
  });

  it("reintenta desde el mensaje de sesión vencida", async () => {
    mockEstado({ validada: false, validacion_en_curso: true });
    mockValidar({ validacion_id: 78, url_4i: "https://4i4id.com/t/def" });
    const assign = stubAssign();

    renderStep(
      "/?type=PF&resultado=timeout&identidad_step=701&grupo=SESION_VENCIDA"
    );

    expect(
      await screen.findByText(/venció antes de que la termines/i)
    ).toBeTruthy();
    fireEvent.click(await screen.findByText(/^Reintentar$/i));

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith("https://4i4id.com/t/def")
    );
  });

  it("un resultado que no conocemos muestra un mensaje genérico y deja reintentar", async () => {
    mockEstado({ validada: false, validacion_en_curso: false });

    renderStep("/?type=PF&resultado=un_resultado_nuevo");

    expect(
      await screen.findByText(/No pudimos interpretar el resultado/i)
    ).toBeTruthy();
    expect(await screen.findByText(/^Reintentar$/i)).toBeTruthy();
  });

  it("muestra un aviso cuando no se puede iniciar la validación", async () => {
    mockEstado({ validada: false, validacion_en_curso: false });
    mockValidarFalla(500);

    renderStep();

    fireEvent.click(await screen.findByText(/Validar mi identidad/i));

    expect(
      await screen.findByText(/No pudimos iniciar la validación de identidad/i)
    ).toBeTruthy();
  });

  it("si el gateway contesta que la identidad ya está validada, releé el estado", async () => {
    mockEstado(
      { validada: false, validacion_en_curso: false },
      { validada: true }
    );
    mockValidarFalla(409);

    renderStep();

    fireEvent.click(await screen.findByText(/Validar mi identidad/i));

    expect(await screen.findByText(/Validamos tu identidad/i)).toBeTruthy();
    expect(screen.queryByText(/No pudimos iniciar/i)).toBeNull();
  });

  it("avisa si no se puede consultar el estado", async () => {
    axiosInstance.get.mockImplementation(() =>
      Promise.reject(new Error("500"))
    );

    renderStep();

    expect(
      await screen.findByText(/No pudimos consultar el estado/i)
    ).toBeTruthy();
  });
});
