import { useEffect } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styled, { ThemeProvider } from "styled-components";
import { lightTheme } from "./assets/themes";
import { ensureFonts } from "./lib/ensureFonts";
import { setDefaultSociety } from "./slices/profile/profileSlice";
import { loggedOut } from "./features/auth/authSlice";
import OnboardingLoginPage from "./features/auth/OnboardingLoginPage";
import { Button } from "./components/Button";
import ActivateAccountCvu from "./features/activateAccountCvu/pages/ActivateAccountCvu";
import IdentityValidationStep from "./features/identityValidation/IdentityValidationStep";
import ComplianceStatusGate from "./features/complianceStatus/ComplianceStatusGate";
import {
  IDENTITY_SCREEN_QUERY_PARAM,
  RESULT_QUERY_PARAM,
} from "./features/identityValidation/lib/constants";

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 24px;
`;

const CvuWizardGate = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isIdentityScreen =
    searchParams.has(RESULT_QUERY_PARAM) ||
    searchParams.has(IDENTITY_SCREEN_QUERY_PARAM);

  if (!isIdentityScreen) {
    return <ActivateAccountCvu />;
  }

  const volverAlAlta = () =>
    setSearchParams(
      (prev) => {
        prev.delete(IDENTITY_SCREEN_QUERY_PARAM);
        return prev;
      },
      { replace: true }
    );

  return (
    <IdentityValidationStep onDone={volverAlAlta} onPrevious={volverAlAlta} />
  );
};

const App = () => {
  const dispatch = useDispatch();
  const [, setSearchParams] = useSearchParams();
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
          onClick={() => {
            dispatch(loggedOut());
            setSearchParams({});
          }}
        >
          Cerrar sesión
        </Button>
      </TopBar>
      <Routes>
        <Route
          path="*"
          element={
            <ComplianceStatusGate sujetoId={sujetoId}>
              <CvuWizardGate />
            </ComplianceStatusGate>
          }
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
