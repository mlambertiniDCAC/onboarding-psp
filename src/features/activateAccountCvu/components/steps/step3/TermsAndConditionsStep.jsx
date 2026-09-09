import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import styled, { useTheme } from "styled-components";
import { Checkbox } from "components/Form/Checkbox";
import { Typography } from "components/Typography";
import InfoAlert from "components/common/InfoAlert";
import InfoMessage from "components/common/InfoMessage";
import WizardStepCard from "components/WizardStepCard/WizardStepCard";
import { useAppNavigate } from "src/hooks/useAppNavigate";
import { selectDefaultSocietyId } from "src/slices/profile/profileSelectors";
import {
  CVU_ACTIVATION_STEP,
  CVU_FLOW_TYPE_BY_PERSON,
  CVU_FINAL_STEP_KEY,
  PERSON_TYPE,
} from "../../../lib/constants";
import { setStepData } from "../../../store/cvuActivation/cvuActivationSlice";
import {
  fetchTermsStep,
  saveDraftStep,
} from "../../../store/cvuActivation/cvuActivationActions";
import {
  selectStepData,
  selectIsSubmitting,
  selectSubmitError,
} from "../../../store/cvuActivation/cvuActivationSelectors";
import { RegistrationSuccessModal } from "./RegistrationSuccessModal";
import { TERMS_SECTIONS_BY_PERSON } from "./constants";

const STEP_COPY = {
  title: "Términos y Condiciones",
  subtitle:
    "A continuación, se detallan los términos y condiciones aplicables a su cuenta.",
  submitLabel: "Enviar documentación",
  infoMessage:
    "Debe aceptar los Términos y Condiciones para poder enviar la documentación.",
};

const TERMS_ACCEPTED_FIELD = "termsAccepted";

// Tolerancia en px para considerar que el scroll llegó al final.
const SCROLL_BOTTOM_THRESHOLD = 8;

const TermsScrollBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 320px;
  overflow-y: auto;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.neutral[150]};
  border-radius: 8px;
`;

const TermsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const TermsAndConditionsStep = ({ personType, onStepChange }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useAppNavigate();
  const stepData = useSelector(selectStepData);
  const societyId = useSelector(selectDefaultSocietyId);
  const isSubmitting = useSelector(selectIsSubmitting);
  const submitError = useSelector(selectSubmitError);

  // Las secciones de T&C dependen del tipo de persona (el flujo/endpoint también).
  const sections = TERMS_SECTIONS_BY_PERSON[personType] ?? [];

  const savedStep3 = stepData?.step3 ?? {};
  const wasAccepted = Boolean(savedStep3.termsAccepted);

  const scrollRef = useRef(null);
  const [hasReadTerms, setHasReadTerms] = useState(wasAccepted);
  const [accepted, setAccepted] = useState(wasAccepted);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Consulta la estructura del paso final (contrato del back: tipo de input).
  useEffect(() => {
    dispatch(fetchTermsStep(personType));
  }, [dispatch, personType]);

  // Si el contenido entra sin necesidad de scroll, se considera leído.
  useEffect(() => {
    const node = scrollRef.current;
    if (node && node.scrollHeight <= node.clientHeight) {
      setHasReadTerms(true);
    }
  }, [sections]);

  // Paso anterior según el tipo de persona: PJ vuelve a Documentación (paso 2),
  // PF vuelve a Información personal (paso 1, no tiene paso de documentación).
  const previousStep =
    personType === PERSON_TYPE.PERSONA_JURIDICA
      ? CVU_ACTIVATION_STEP.STEP_2
      : CVU_ACTIVATION_STEP.STEP_1;

  const handleScroll = (event) => {
    if (hasReadTerms) return;
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const reachedBottom =
      scrollTop + clientHeight >= scrollHeight - SCROLL_BOTTOM_THRESHOLD;
    if (reachedBottom) setHasReadTerms(true);
  };

  const handleAcceptChange = (_name, value) => setAccepted(value);

  const isSubmitDisabled = !accepted || isSubmitting;

  const persistStepData = () => {
    dispatch(
      setStepData({
        step: CVU_ACTIVATION_STEP.STEP_3,
        data: { termsAccepted: accepted },
      })
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitDisabled) return;
    persistStepData();
    try {
      await dispatch(
        saveDraftStep({
          societyId,
          tipoFlujo: CVU_FLOW_TYPE_BY_PERSON[personType],
          stepKey: CVU_FINAL_STEP_KEY,
          value: { terminos_condiciones_aceptado: accepted },
        })
      ).unwrap();
      setShowSuccessModal(true);
    } catch {
      // El error se refleja vía submitError en el store.
    }
  };

  const handlePrevious = () => {
    persistStepData();
    onStepChange(previousStep);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  const acceptanceLabel = (
    <>
      Leí y acepto los{" "}
      <Typography
        variant="small"
        fontWeight="bold"
        color={theme.colors.neutral[700]}
      >
        Términos y Condiciones
      </Typography>{" "}
      y la{" "}
      <Typography
        variant="small"
        fontWeight="bold"
        color={theme.colors.neutral[700]}
      >
        Política de Privacidad
      </Typography>{" "}
      de deCampoPagos. Declaro que la información y documentación proporcionada
      es verdadera y está vigente.
    </>
  );

  return (
    <>
      <WizardStepCard onSubmit={handleSubmit}>
        <WizardStepCard.Header
          title={STEP_COPY.title}
          subtitle={STEP_COPY.subtitle}
        />

        <WizardStepCard.Body gap={24}>
          <TermsScrollBox ref={scrollRef} onScroll={handleScroll}>
            {sections.map((section) => (
              <TermsSection key={section.id}>
                <Typography
                  variant="small"
                  fontWeight="bold"
                  color={theme.colors.neutral[700]}
                >
                  {section.title}
                </Typography>
                <Typography variant="small" color={theme.colors.neutral[500]}>
                  {section.body}
                </Typography>
              </TermsSection>
            ))}
          </TermsScrollBox>

          <Checkbox
            name={TERMS_ACCEPTED_FIELD}
            checked={accepted}
            onChange={handleAcceptChange}
            disabled={!hasReadTerms}
            label={acceptanceLabel}
          />

          {!accepted && <InfoAlert title={STEP_COPY.infoMessage} />}

          {submitError && (
            <InfoMessage
              variant="danger"
              message="No pudimos enviar la aceptación de los términos. Intentá nuevamente más tarde."
            />
          )}
        </WizardStepCard.Body>

        <WizardStepCard.Footer
          onPrevious={handlePrevious}
          nextLabel={STEP_COPY.submitLabel}
          isNextDisabled={isSubmitDisabled}
          isNextLoading={isSubmitting}
        />
      </WizardStepCard>

      <RegistrationSuccessModal
        open={showSuccessModal}
        onClose={handleSuccessClose}
      />
    </>
  );
};

TermsAndConditionsStep.propTypes = {
  personType: PropTypes.oneOf(Object.values(PERSON_TYPE)).isRequired,
  onStepChange: PropTypes.func.isRequired,
};

export default TermsAndConditionsStep;
