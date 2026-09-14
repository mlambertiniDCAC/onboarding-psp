import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styled, { ThemeProvider } from "styled-components";
import { lightTheme } from "./assets/themes";
import { ensureFonts } from "./lib/ensureFonts";
import { setDefaultSociety } from "./slices/profile/profileSlice";
import { loggedOut } from "./features/auth/authSlice";
import OnboardingLoginPage from "./features/auth/OnboardingLoginPage";
import { Button } from "./components/Button";
import ActivateAccountCvu from "./features/activateAccountCvu/pages/ActivateAccountCvu";

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 24px;
`;

const App = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const sujetoId = useSelector((state) => state.auth.sujetoId);

  useEffect(() => {
    ensureFonts();
  }, []);

  useEffect(() => {
    if (sujetoId) dispatch(setDefaultSociety({ id: sujetoId }));
  }, [dispatch, sujetoId]);

  if (!token || !sujetoId) {
    return (
      <ThemeProvider theme={lightTheme}>
        <OnboardingLoginPage />
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
      <Routes>
        <Route path="*" element={<ActivateAccountCvu />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
