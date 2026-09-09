import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { InputRadioCardGroup } from "components/Form/InputRadioCardGroup";
import { FormSection } from "components/Form/FormSection";
import InfoMessage from "components/common/InfoMessage";
import Skeleton from "components/common/Skeleton";
import WizardStepCard from "components/WizardStepCard/WizardStepCard";
import {
  selectDefaultSociety,
  selectDefaultSocietyId,
} from "src/slices/profile/profileSelectors";
import {
  CVU_ACTIVATION_STEP,
  CVU_FORM_TYPE,
  CVU_FLOW_TYPE_BY_PERSON,
} from "../../../lib/constants";
import { setStepData } from "../../../store/cvuActivation/cvuActivationSlice";
import {
  fetchLegalConditionStep,
  saveDraftStep,
  createDraft,
} from "../../../store/cvuActivation/cvuActivationActions";
import {
  selectStepData,
  selectHasExistingDraft,
  selectLegalConditionOptions,
  selectIsFetchingLegalCondition,
  selectLegalConditionError,
  selectIsSubmitting,
  selectSubmitError,
} from "../../../store/cvuActivation/cvuActivationSelectors";
import { mergeLegalConditionOptions } from "./constants";

const OPTIONS_SKELETON_COUNT = 2;

const SkeletonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

export const ActivationStep0 = ({ onStepChange }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const defaultSociety = useSelector(selectDefaultSociety);
  const societyId = useSelector(selectDefaultSocietyId);
  const stepData = useSelector(selectStepData);
  const hasExistingDraft = useSelector(selectHasExistingDraft);
  const legalConditionOptions = useSelector(selectLegalConditionOptions);
  const isFetching = useSelector(selectIsFetchingLegalCondition);
  const fetchError = useSelector(selectLegalConditionError);
  const isSubmitting = useSelector(selectIsSubmitting);
  const submitError = useSelector(selectSubmitError);

  const [legalCondition, setLegalCondition] = useState(
    stepData?.step0?.legalCondition ?? ""
  );

  const societyName = defaultSociety?.razon_social ?? "tu sociedad";

  const options = useMemo(
    () => mergeLegalConditionOptions(legalConditionOptions),
    [legalConditionOptions]
  );

  useEffect(() => {
    dispatch(fetchLegalConditionStep());
  }, [dispatch]);

  const handleChange = (_name, value) => {
    setLegalCondition(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!legalCondition || isSubmitting) return;
    try {
      // Si ya hay un registro en proceso (status con data) actualizamos con PUT;
      // si no, creamos el draft con POST. El POST usa el flujo genérico ALTA_CVU;
      // el PUT usa el flujo específico según la condición legal elegida (PF/PJ).
      const persistDraft = hasExistingDraft ? saveDraftStep : createDraft;
      const tipoFlujo = hasExistingDraft
        ? CVU_FLOW_TYPE_BY_PERSON[legalCondition]
        : CVU_FORM_TYPE;
      await dispatch(
        persistDraft({
          societyId,
          tipoFlujo,
          step: CVU_ACTIVATION_STEP.STEP_0,
          value: { condicion_legal: legalCondition },
        })
      ).unwrap();
      dispatch(
        setStepData({
          step: CVU_ACTIVATION_STEP.STEP_0,
          data: { legalCondition },
        })
      );
      onStepChange(CVU_ACTIVATION_STEP.STEP_1, { type: legalCondition });
    } catch {
      // El error se refleja vía submitError en el store.
    }
  };

  const handlePrevious = () => {
    onStepChange(null);
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
        name="legalCondition"
        options={options}
        value={legalCondition}
        onChange={handleChange}
      />
    );
  };

  return (
    <WizardStepCard onSubmit={handleSubmit}>
      <WizardStepCard.Header
        title="Condición legal de la sociedad"
        subtitle="A continuación indicá la condición legal de tu sociedad"
      />

      <WizardStepCard.Body>
        <FormSection
          title={`${societyName} es:`}
          titleColor={theme.colors.neutral[500]}
        >
          {renderOptions()}
        </FormSection>

        <InfoMessage
          variant="info"
          message="Esta selección define la condición legal de la sociedad, no del usuario que completa este formulario."
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
        isNextDisabled={!legalCondition || isFetching || isSubmitting}
        isNextLoading={isSubmitting}
      />
    </WizardStepCard>
  );
};

ActivationStep0.propTypes = {
  onStepChange: PropTypes.func.isRequired,
};

export default ActivationStep0;
