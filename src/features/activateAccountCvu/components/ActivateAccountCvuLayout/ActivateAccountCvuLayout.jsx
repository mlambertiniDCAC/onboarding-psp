import PropTypes from "prop-types";
import styled from "styled-components";
import Timeline from "components/Timeline/Timeline";
import { WIZARD_STEP_CARD_MAX_WIDTH } from "components/WizardStepCard/WizardStepCard";
import CvuActivationIntro from "../CvuActivationIntro/CvuActivationIntro";
import { ActivationStep0 } from "../steps/step0/ActivationStep0";
import { ActivationStep1PersonalInfo } from "../steps/step1/PF/ActivationStep1PersonalInfo";
import { ActivationStep1LegalEntityType } from "../steps/step1/PJ/ActivationStep1LegalEntityType";
import { ActivationStep2Documentation } from "../steps/step2/PJ/ActivationStep2Documentation";
import { TermsAndConditionsStep } from "../steps/step3/TermsAndConditionsStep";
import {
  CVU_ACTIVATION_STEP,
  PERSON_TYPE,
  cvuActivationStepsByType,
} from "../../lib/constants";

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

const ActivateAccountCvuLayout = ({
  currentStep,
  personType,
  sujetoId,
  onStepChange,
}) => {
  const renderStep = () => {
    switch (currentStep) {
      case CVU_ACTIVATION_STEP.STEP_0:
        return <ActivationStep0 onStepChange={onStepChange} />;
      case CVU_ACTIVATION_STEP.STEP_1:
        return personType === PERSON_TYPE.PERSONA_FISICA ? (
          <ActivationStep1PersonalInfo onStepChange={onStepChange} />
        ) : (
          <ActivationStep1LegalEntityType onStepChange={onStepChange} />
        );
      case CVU_ACTIVATION_STEP.STEP_2:
        return personType === PERSON_TYPE.PERSONA_JURIDICA ? (
          <ActivationStep2Documentation onStepChange={onStepChange} />
        ) : null;
      case CVU_ACTIVATION_STEP.STEP_3:
        return (
          <TermsAndConditionsStep
            personType={personType}
            onStepChange={onStepChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <Content>
        {currentStep !== null && currentStep !== CVU_ACTIVATION_STEP.STEP_0 && (
          <Timeline
            steps={cvuActivationStepsByType(personType)}
            currentStepId={currentStep}
          />
        )}
        {currentStep === null ? (
          <CvuActivationIntro sujetoId={sujetoId} onStepChange={onStepChange} />
        ) : (
          renderStep()
        )}
      </Content>
    </Container>
  );
};

ActivateAccountCvuLayout.propTypes = {
  currentStep: PropTypes.number,
  personType: PropTypes.oneOf(Object.values(PERSON_TYPE)),
  sujetoId: PropTypes.string,
  onStepChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

ActivateAccountCvuLayout.defaultProps = {
  currentStep: null,
  personType: PERSON_TYPE.PERSONA_FISICA,
  sujetoId: undefined,
};

export default ActivateAccountCvuLayout;
