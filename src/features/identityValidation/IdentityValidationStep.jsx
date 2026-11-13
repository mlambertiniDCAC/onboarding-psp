import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import WizardStepCard, {
  WIZARD_STEP_CARD_MAX_WIDTH,
} from "components/WizardStepCard/WizardStepCard";
import InfoMessage from "components/common/InfoMessage";
import { Typography } from "components/Typography";
import { Button } from "components/Button";
import axiosInstance from "src/lib/axiosInstance";
import {
  IDENTITY_ME_PATH,
  IDENTITY_SCREEN_QUERY_PARAM,
  IDENTITY_VALIDATE_PATH,
  RESULT_QUERY_PARAM,
  RETURN_GROUP_QUERY_PARAM,
  RETURN_STEP_QUERY_PARAM,
} from "./lib/constants";
import { resolveIdentityOutcome } from "./lib/identityOutcome";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
`;

const Content = styled.div`
  width: 100%;
  max-width: ${WIZARD_STEP_CARD_MAX_WIDTH}px;
  margin: 0 auto;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 24px;
`;

const ERROR_ESTADO =
  "No pudimos consultar el estado de tu validación de identidad.";

const ERROR_INICIO =
  "No pudimos iniciar la validación de identidad. Volvé a intentar.";

const leerRetorno = (searchParams) => {
  const resultado = searchParams.get(RESULT_QUERY_PARAM);
  if (!resultado) return null;
  return {
    resultado,
    step: searchParams.get(RETURN_STEP_QUERY_PARAM),
    grupo: searchParams.get(RETURN_GROUP_QUERY_PARAM),
  };
};

const IdentityValidationStep = ({ onDone, onPrevious }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [retorno] = useState(() => leerRetorno(searchParams));
  const [estado, setEstado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);

  const loadEstado = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(IDENTITY_ME_PATH);
      setEstado(response?.data ?? null);
    } catch {
      setError(ERROR_ESTADO);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEstado();
  }, []);

  useEffect(() => {
    if (!searchParams.has(RESULT_QUERY_PARAM)) return;
    setSearchParams(
      (prev) => {
        prev.delete(RESULT_QUERY_PARAM);
        prev.delete(RETURN_STEP_QUERY_PARAM);
        prev.delete(RETURN_GROUP_QUERY_PARAM);
        prev.set(IDENTITY_SCREEN_QUERY_PARAM, "1");
        return prev;
      },
      { replace: true }
    );
  }, [searchParams, setSearchParams]);

  const startValidation = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const response = await axiosInstance.post(IDENTITY_VALIDATE_PATH, {});
      const url = response?.data?.url_4i ?? null;
      if (url) {
        window.location.assign(url);
        return;
      }
      setError(ERROR_INICIO);
    } catch (requestError) {
      if (requestError?.response?.status === 409) {
        await loadEstado();
      } else {
        setError(ERROR_INICIO);
      }
    }
    setIsStarting(false);
  };

  const isValidated = Boolean(estado?.validada);
  const hasOutcome = !isLoading && (isValidated || Boolean(retorno));
  const outcome = hasOutcome
    ? resolveIdentityOutcome({
        resultado: retorno?.resultado,
        step: retorno?.step,
        grupo: retorno?.grupo,
        estado,
      })
    : null;

  const resolveNextAction = () => {
    if (isLoading) return { label: "Validar mi identidad", run: null };
    if (isValidated) return { label: "Siguiente", run: onDone };
    if (outcome?.canRefresh)
      return { label: "Actualizar estado", run: loadEstado };
    if (outcome?.canRetry) return { label: "Reintentar", run: startValidation };
    if (outcome) return null;
    return {
      label: estado?.validacion_en_curso
        ? "Iniciar de nuevo la validación"
        : "Validar mi identidad",
      run: startValidation,
    };
  };

  const nextAction = resolveNextAction();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (nextAction?.run) nextAction.run();
  };

  return (
    <Container>
      <Content>
        <WizardStepCard onSubmit={handleSubmit}>
          <WizardStepCard.Header
            title="Validación de identidad"
            subtitle="Validá tu identidad con 4i para continuar con la activación."
          />
          <WizardStepCard.Body>
            {isLoading && (
              <Typography variant="regular">
                Consultando el estado de tu validación de identidad...
              </Typography>
            )}
            {!isLoading && outcome && (
              <InfoMessage
                variant={outcome.variant}
                message={outcome.message}
              />
            )}
            {!isLoading && !outcome && (
              <>
                <Typography variant="regular">
                  Al continuar salís de esta pantalla y vas al proceso de
                  validación de 4i, donde le sacás una foto a tu documento y a
                  tu cara. Cuando termines volvés acá solo.
                </Typography>
                <Typography variant="regular">
                  Si entrás desde una computadora vas a ver un código QR para
                  escanear con el celular: validá ahí y seguí desde esta misma
                  computadora, que es donde vuelve el resultado.
                </Typography>
                {estado?.validacion_en_curso && (
                  <InfoMessage
                    variant="info"
                    message="Quedó una validación sin terminar. Si no llegaste a completarla, iniciá una nueva."
                  />
                )}
              </>
            )}
            {error && <InfoMessage variant="danger" message={error} />}
          </WizardStepCard.Body>
          {nextAction ? (
            <WizardStepCard.Footer
              onPrevious={onPrevious}
              nextLabel={nextAction.label}
              isNextDisabled={isLoading || isStarting}
              isNextLoading={isStarting}
            />
          ) : (
            <WizardStepCard.Footer>
              <Button
                tone="brand"
                role="tertiary"
                type="button"
                onClick={onPrevious}
              >
                Anterior
              </Button>
            </WizardStepCard.Footer>
          )}
        </WizardStepCard>
      </Content>
    </Container>
  );
};

IdentityValidationStep.propTypes = {
  onDone: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

export default IdentityValidationStep;
