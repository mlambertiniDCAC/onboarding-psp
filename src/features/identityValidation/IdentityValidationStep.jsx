import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import Timeline from "components/Timeline/Timeline";
import WizardStepCard, {
  WIZARD_STEP_CARD_MAX_WIDTH,
} from "components/WizardStepCard/WizardStepCard";
import InfoMessage from "components/common/InfoMessage";
import { Typography } from "components/Typography";
import axiosInstance from "src/lib/axiosInstance";
import {
  CVU_ACTIVATION_STEP,
  CVU_FLOW_TYPE,
  PERSON_TYPE,
  cvuActivationStepsByType,
} from "src/features/activateAccountCvu/lib/constants";
import { saveDraftStep } from "src/features/activateAccountCvu/store/cvuActivation/cvuActivationActions";

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

const IdentityValidationStep = ({ sujetoId, onDone, onPrevious }) => {
  const dispatch = useDispatch();
  const [validation, setValidation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    axiosInstance
      .post(`/v1/compliance/${sujetoId}/validacion-identidad/iniciar`)
      .then((response) => {
        if (!cancelled) setValidation(response.data?.data ?? null);
      })
      .catch(() => {
        if (!cancelled)
          setError("No pudimos iniciar la validación de identidad.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sujetoId]);

  const isMock = validation?.service_url?.startsWith("mock://");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validation) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await dispatch(
        saveDraftStep({
          societyId: sujetoId,
          tipoFlujo: CVU_FLOW_TYPE.PF,
          step: CVU_ACTIVATION_STEP.STEP_2,
          value: { external_id: validation.external_id },
        })
      ).unwrap();
      onDone();
    } catch {
      setError(
        "La validación de identidad no se pudo confirmar. Volvé a intentar."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Content>
        <Timeline
          steps={cvuActivationStepsByType(PERSON_TYPE.PERSONA_FISICA)}
          currentStepId={CVU_ACTIVATION_STEP.STEP_2}
        />
        <WizardStepCard onSubmit={handleSubmit}>
          <WizardStepCard.Header
            title="Validación de identidad"
            subtitle="Confirmá la identidad de la persona antes de continuar."
          />
          <WizardStepCard.Body>
            {isLoading && (
              <Typography variant="regular">Iniciando validación...</Typography>
            )}
            {!isLoading && isMock && (
              <InfoMessage
                variant="info"
                message="Entorno de prueba: la validación de identidad está simulada (API4I_MOCK). Al continuar se aprueba automáticamente."
              />
            )}
            {!isLoading && validation && !isMock && (
              <>
                <Typography variant="regular">
                  Abrí el siguiente enlace para completar la validación
                  biométrica de la persona. Cuando termine, volvé acá y
                  continuá.
                </Typography>
                <a
                  href={validation.service_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {validation.service_url}
                </a>
              </>
            )}
            {error && <InfoMessage variant="danger" message={error} />}
          </WizardStepCard.Body>
          <WizardStepCard.Footer
            onPrevious={onPrevious}
            nextLabel={isMock ? "Continuar (mock)" : "Ya completé la validación"}
            isNextDisabled={!validation || isSubmitting}
            isNextLoading={isSubmitting}
          />
        </WizardStepCard>
      </Content>
    </Container>
  );
};

IdentityValidationStep.propTypes = {
  sujetoId: PropTypes.string.isRequired,
  onDone: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

export default IdentityValidationStep;
