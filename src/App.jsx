import { useEffect } from "react";
import PropTypes from "prop-types";
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
  CVU_ACTIVATION_STEP,
  PERSON_TYPE,
  STEP_QUERY_PARAM,
  TYPE_QUERY_PARAM,
} from "./features/activateAccountCvu/lib/constants";

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 24px;
`;

const CvuWizardGate = ({ sujetoId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isPfIdentityStep =
    searchParams.get(TYPE_QUERY_PARAM) === PERSON_TYPE.PERSONA_FISICA &&
    Number(searchParams.get(STEP_QUERY_PARAM)) === CVU_ACTIVATION_STEP.STEP_2;

  if (!isPfIdentityStep) {
    return <ActivateAccountCvu />;
  }

  const goToStep = (step) =>
    setSearchParams((prev) => {
      prev.set(STEP_QUERY_PARAM, String(step));
      prev.set(TYPE_QUERY_PARAM, PERSON_TYPE.PERSONA_FISICA);
      return prev;
    });

  return (
    <IdentityValidationStep
      sujetoId={sujetoId}
      onDone={() => goToStep(CVU_ACTIVATION_STEP.STEP_3)}
      onPrevious={() => goToStep(CVU_ACTIVATION_STEP.STEP_1)}
    />
  );
};

CvuWizardGate.propTypes = {
  sujetoId: PropTypes.string.isRequired,
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
              <CvuWizardGate sujetoId={sujetoId} />
            </ComplianceStatusGate>
          }
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
