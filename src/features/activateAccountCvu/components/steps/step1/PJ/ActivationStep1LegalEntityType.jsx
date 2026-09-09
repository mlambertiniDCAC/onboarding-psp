import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { InputRadioCardGroup } from "components/Form/InputRadioCardGroup";
import { FormSection } from "components/Form/FormSection";
import InfoAlert from "components/common/InfoAlert";
import InfoMessage from "components/common/InfoMessage";
import Skeleton from "components/common/Skeleton";
import WizardStepCard from "components/WizardStepCard/WizardStepCard";
import {
  selectDefaultSociety,
  selectDefaultSocietyId,
} from "src/slices/profile/profileSelectors";
import { CVU_ACTIVATION_STEP, CVU_FLOW_TYPE } from "../../../../lib/constants";
import { setStepData } from "../../../../store/cvuActivation/cvuActivationSlice";
import {
  fetchSocietyTypeStep,
  saveDraftStep,
} from "../../../../store/cvuActivation/cvuActivationActions";
import {
  selectStepData,
  selectSocietyTypeOptions,
  selectIsFetchingSocietyType,
  selectSocietyTypeError,
  selectIsSubmitting,
  selectSubmitError,
} from "../../../../store/cvuActivation/cvuActivationSelectors";
import { mergeSocietyTypeOptions } from "./constants";

const OPTIONS_SKELETON_COUNT = 4;

const SkeletonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

export const ActivationStep1LegalEntityType = ({ onStepChange }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const defaultSociety = useSelector(selectDefaultSociety);
  const societyId = useSelector(selectDefaultSocietyId);
  const stepData = useSelector(selectStepData);
  const societyTypeOptions = useSelector(selectSocietyTypeOptions);
  const isFetching = useSelector(selectIsFetchingSocietyType);
  const fetchError = useSelector(selectSocietyTypeError);
  const isSubmitting = useSelector(selectIsSubmitting);
  const submitError = useSelector(selectSubmitError);

  const [societyType, setSocietyType] = useState(
    stepData?.step1?.societyType ?? ""
  );

  const societyName = defaultSociety?.razon_social ?? "tu sociedad";

  const options = useMemo(
    () => mergeSocietyTypeOptions(societyTypeOptions),
    [societyTypeOptions]
  );

  useEffect(() => {
    dispatch(fetchSocietyTypeStep());
  }, [dispatch]);

  const handleChange = (_name, value) => {
    setSocietyType(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!societyType || isSubmitting) return;
    try {
      await dispatch(
        saveDraftStep({
          societyId,
          tipoFlujo: CVU_FLOW_TYPE.PJ,
          step: CVU_ACTIVATION_STEP.STEP_1,
          value: { tipo_societario: societyType },
        })
      ).unwrap();
      dispatch(
        setStepData({
          step: CVU_ACTIVATION_STEP.STEP_1,
          data: { societyType },
        })
      );
      onStepChange(CVU_ACTIVATION_STEP.STEP_2);
    } catch {
      // El error se refleja vía submitError en el store.
    }
  };

  const handlePrevious = () => {
    onStepChange(CVU_ACTIVATION_STEP.STEP_0);
  };

  const renderOptions = () => {
    if (isFetching) {
      return (
        <SkeletonGroup>
          {Array.from({ length: OPTIONS_SKELETON_COUNT }).map((_, index) => (
            <Skeleton key={index} height="65px" />
          ))}
        </SkeletonGroup>
      );
    }

    if (fetchError || options.length === 0) {
      return (
        <InfoMessage
          variant="danger"
          message="No pudimos cargar las opciones. Intentá nuevamente más tarde."
        />
      );
    }

    return (
      <InputRadioCardGroup
        name="societyType"
        options={options}
        value={societyType}
        onChange={handleChange}
      />
    );
  };

  return (
    <WizardStepCard onSubmit={handleSubmit}>
      <WizardStepCard.Header
        title="Tipo de sociedad"
        subtitle="A continuación, seleccioná el tipo de sociedad"
      />

      <WizardStepCard.Body gap={24}>
        <FormSection
          title={`${societyName} es:`}
          titleColor={theme.colors.neutral[500]}
        >
          {renderOptions()}
        </FormSection>

        <InfoAlert
          title="Solo se puede crear una cuenta virtual por sociedad."
          description="En caso de querer crear otra cuenta, se debe cambiar de sociedad en el Inicio."
        />

        {submitError && (
          <InfoMessage
            variant="danger"
            message="No pudimos guardar la selección. Intentá nuevamente más tarde."
          />
        )}
      </WizardStepCard.Body>

      <WizardStepCard.Footer
        onPrevious={handlePrevious}
        isNextDisabled={!societyType || isFetching || isSubmitting}
        isNextLoading={isSubmitting}
      />
    </WizardStepCard>
  );
};

ActivationStep1LegalEntityType.propTypes = {
  onStepChange: PropTypes.func.isRequired,
};

export default ActivationStep1LegalEntityType;
