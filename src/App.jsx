import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styled, { ThemeProvider } from "styled-components";
import { lightTheme } from "./assets/themes";
import { ensureFonts } from "./lib/ensureFonts";
import { setDefaultSociety } from "./slices/profile/profileSlice";
import { resolveRefExterna } from "./bootstrap/resolveRefExterna";
import { loggedOut } from "./features/auth/authSlice";
import LoginPage from "./features/auth/LoginPage";
import SujetoIdForm from "./features/onboarding/SujetoIdForm";
import { Button } from "./components/Button";
import ActivateAccountCvu from "./features/activateAccountCvu/pages/ActivateAccountCvu";

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 24px;
`;

const App = () => {
  const dispatch = useDispatch();
  const { search } = useLocation();
  const token = useSelector((state) => state.auth.token);
  const [manualSujetoId, setManualSujetoId] = useState(null);

  const { refExterna: refExternaFromUrl, razonSocial } = resolveRefExterna({
    search,
  });
  const refExterna = manualSujetoId ?? refExternaFromUrl;

  useEffect(() => {
    ensureFonts();
  }, []);

  useEffect(() => {
    if (refExterna) {
      dispatch(
        setDefaultSociety({
          id: refExterna,
          razon_social: razonSocial ?? undefined,
        })
      );
    }
  }, [dispatch, refExterna, razonSocial]);

  if (!token) {
    return (
      <ThemeProvider theme={lightTheme}>
        <LoginPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <TopBar>
        <Button
          tone="neutral"
          role="secondary"
          size="small"
          type="button"
          onClick={() => dispatch(loggedOut())}
        >
          Cerrar sesión
        </Button>
      </TopBar>
      {refExterna ? (
        <Routes>
          <Route path="*" element={<ActivateAccountCvu />} />
        </Routes>
      ) : (
        <SujetoIdForm onSubmit={setManualSujetoId} />
      )}
    </ThemeProvider>
  );
};

export default App;
