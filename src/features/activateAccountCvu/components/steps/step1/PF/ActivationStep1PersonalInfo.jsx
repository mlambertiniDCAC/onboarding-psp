import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { InputForm } from "components/Form/InputForm";
import { InputCheckboxCardGroup } from "components/Form/InputCheckboxCardGroup";
import { FormSection, FormSections } from "components/Form/FormSection";
import InfoAlert from "components/common/InfoAlert";
import InfoMessage from "components/common/InfoMessage";
import Skeleton from "components/common/Skeleton";
import WizardStepCard from "components/WizardStepCard/WizardStepCard";
import { selectDefaultSocietyId } from "src/slices/profile/profileSelectors";
import { CVU_ACTIVATION_STEP, CVU_FLOW_TYPE } from "../../../../lib/constants";
import {
  getRegulationRequiringConfirmation,
  normalizeRegulations,
  regulationsToApiFlags,
  toggleRegulationSelection,
} from "../../../../lib/regulationHelpers";
import { setStepData } from "../../../../store/cvuActivation/cvuActivationSlice";
import {
  fetchPersonalInfoStep,
  saveDraftStep,
} from "../../../../store/cvuActivation/cvuActivationActions";
import {
  selectStepData,
  selectOccupationOptions,
  selectIsFetchingPersonalInfo,
  selectPersonalInfoError,
  selectIsSubmitting,
  selectSubmitError,
} from "../../../../store/cvuActivation/cvuActivationSelectors";
import {
  REGULATION_CONFIRMATION,
  REGULATION_OPTIONS,
} from "../../../../lib/personalInfoConstants";
import { RegulationConfirmationModal } from "./RegulationConfirmationModal";

const REGULATIONS_SKELETON_HEIGHT = "64px";

const SkeletonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const validationSchema = Yup.object().shape({
  occupation: Yup.object().required("Seleccioná una ocupación"),
  regulations: Yup.array()
    .of(Yup.string())
    .min(1, "Seleccioná al menos una regulación")
    .required("Seleccioná al menos una regulación"),
});

// El back define las opciones (value === label); si el valor guardado no está
// entre ellas (o todavía no cargaron), lo reconstruimos para no perderlo.
const findOccupationOption = (options, occupationValue) =>
  options.find((option) => option.value === occupationValue) ?? {
    value: occupationValue,
    label: occupationValue,
  };

const mapValuesToStepData = (values) => ({
  occupation: values.occupation?.value ?? null,
  regulations: values.regulations,
});

export const ActivationStep1PersonalInfo = ({ onStepChange }) => {
  const dispatch = useDispatch();
  const societyId = useSelector(selectDefaultSocietyId);
  const stepData = useSelector(selectStepData);
  const occupationOptions = useSelector(selectOccupationOptions);
  const isFetching = useSelector(selectIsFetchingPersonalInfo);
  const fetchError = useSelector(selectPersonalInfoError);
  const isSubmitting = useSelector(selectIsSubmitting);
  const submitError = useSelector(selectSubmitError);
  const savedStepData = stepData?.step1 ?? {};

  // Regulación marcada que espera confirmación vía modal (SO o PEP).
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const confirmationQuestion = pendingConfirmation
    ? REGULATION_CONFIRMATION[pendingConfirmation.regulation]
    : null;

  useEffect(() => {
    dispatch(fetchPersonalInfoStep());
  }, [dispatch]);

  const initialValues = useMemo(
    () => ({
      occupation: savedStepData.occupation
        ? findOccupationOption(occupationOptions, savedStepData.occupation)
        : null,
      regulations: normalizeRegulations(savedStepData.regulations),
    }),
    [savedStepData, occupationOptions]
  );

  const persistStepData = (values) => {
    dispatch(
      setStepData({
        step: CVU_ACTIVATION_STEP.STEP_1,
        data: mapValuesToStepData(values),
      })
    );
  };

  const handleFormSubmit = async (values) => {
    if (isSubmitting) return;
    try {
      await dispatch(
        saveDraftStep({
          societyId,
          tipoFlujo: CVU_FLOW_TYPE.PF,
          step: CVU_ACTIVATION_STEP.STEP_1,
          value: {
            ocupacion: values.occupation?.value ?? null,
            ...regulationsToApiFlags(values.regulations),
          },
        })
      ).unwrap();
      persistStepData(values);
      onStepChange(CVU_ACTIVATION_STEP.STEP_2);
    } catch {
      // El error se refleja vía submitError en el store.
    }
  };

  const handlePrevious = (values) => {
    persistStepData(values);
    onStepChange(CVU_ACTIVATION_STEP.STEP_0);
  };

  const renderRegulationsField = (values, handleRegulationsChange) => {
    if (isFetching) {
      return (
        <SkeletonGroup>
          {REGULATION_OPTIONS.map((option) => (
            <Skeleton key={option.value} height={REGULATIONS_SKELETON_HEIGHT} />
          ))}
        </SkeletonGroup>
      );
    }

    return (
      <InputCheckboxCardGroup
        name="regulations"
        options={REGULATION_OPTIONS}
        value={values.regulations}
        onChange={handleRegulationsChange}
      />
    );
  };

  const renderOccupationField = (values, setFieldValue) => {
    if (isFetching) {
      return <Skeleton height="48px" />;
    }

    if (fetchError || occupationOptions.length === 0) {
      return (
        <InfoMessage
          variant="danger"
          message="No pudimos cargar las opciones. Intentá nuevamente más tarde."
        />
      );
    }

    return (
      <InputForm
        type="select"
        name="occupation"
        placeholder="Seleccionar"
        value={values.occupation}
        options={occupationOptions}
        onChange={(name, value) => setFieldValue(name, value, true)}
        enabledBorder
      />
    );
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount
      onSubmit={handleFormSubmit}
    >
      {({ values, setFieldValue, handleSubmit, isValid }) => {
        const applyRegulations = (nextRegulations) =>
          setFieldValue(
            "regulations",
            toggleRegulationSelection(values.regulations, nextRegulations),
            true
          );

        const handleRegulationsChange = (name, nextRegulations) => {
          const regulationToConfirm = getRegulationRequiringConfirmation(
            values.regulations,
            nextRegulations
          );

          if (regulationToConfirm) {
            setPendingConfirmation({
              regulation: regulationToConfirm,
              nextRegulations,
            });
            return;
          }

          applyRegulations(nextRegulations);
        };

        const handleConfirmRegulation = () => {
          if (pendingConfirmation) {
            applyRegulations(pendingConfirmation.nextRegulations);
          }
          setPendingConfirmation(null);
        };

        return (
          <WizardStepCard onSubmit={handleSubmit}>
            <WizardStepCard.Header
              title="Información personal"
              subtitle="A continuación seleccioná qué tipo de persona sos"
            />

            <WizardStepCard.Body gap={24}>
              <FormSections>
                <FormSection title="Elegí tu ocupación">
                  {renderOccupationField(values, setFieldValue)}
                </FormSection>

                <FormSection title="¿Cumplís con alguna de estas regulaciones?">
                  {renderRegulationsField(values, handleRegulationsChange)}
                </FormSection>
              </FormSections>

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
              onPrevious={() => handlePrevious(values)}
              isNextDisabled={!isValid || isFetching || isSubmitting}
              isNextLoading={isSubmitting}
            />

            <RegulationConfirmationModal
              open={Boolean(pendingConfirmation)}
              question={confirmationQuestion}
              onConfirm={handleConfirmRegulation}
              onCancel={() => setPendingConfirmation(null)}
            />
          </WizardStepCard>
        );
      }}
    </Formik>
  );
};

ActivationStep1PersonalInfo.propTypes = {
  onStepChange: PropTypes.func.isRequired,
};

export default ActivationStep1PersonalInfo;
