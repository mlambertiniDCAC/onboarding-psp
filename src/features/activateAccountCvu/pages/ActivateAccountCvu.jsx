import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ActivateAccountCvuLayout from "../components/ActivateAccountCvuLayout/ActivateAccountCvuLayout";
import {
  CVU_ACTIVATION_STEP,
  PERSON_TYPE,
  STEP_QUERY_PARAM,
  TYPE_QUERY_PARAM,
  parsePersonTypeFromUrl,
} from "../lib/constants";
import { RESULT_QUERY_PARAM } from "src/features/identityValidation/lib/constants";
import { selectDefaultSocietyId } from "src/slices/profile/profileSelectors";
import { fetchCvuActivationStatus } from "../store/cvuActivation/cvuActivationActions";
import {
  selectRegistrationStatus,
  selectIsFetchingStatus,
  selectStepData,
} from "../store/cvuActivation/cvuActivationSelectors";

const VALID_STEPS = Object.values(CVU_ACTIVATION_STEP);

const parseStepFromUrl = (searchParams) => {
  const raw = searchParams.get(STEP_QUERY_PARAM);
  if (raw === null) return null;
  const parsed = Number(raw);
  return VALID_STEPS.includes(parsed) ? parsed : null;
};

const ActivateAccountCvu = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vuelveDe4i] = useState(() => searchParams.has(RESULT_QUERY_PARAM));
  const [currentStep, setCurrentStep] = useState(() =>
    vuelveDe4i ? CVU_ACTIVATION_STEP.STEP_2 : parseStepFromUrl(searchParams)
  );

  const registrationStatus = useSelector(selectRegistrationStatus);
  const isFetchingStatus = useSelector(selectIsFetchingStatus);
  const stepData = useSelector(selectStepData);
  const societyId = useSelector(selectDefaultSocietyId);

  const personType =
    parsePersonTypeFromUrl(searchParams) ??
    stepData?.step0?.legalCondition ??
    PERSON_TYPE.PERSONA_FISICA;

  const goToStep = useCallback(
    (step, { type } = {}) => {
      setCurrentStep(step);
      setSearchParams(
        (prev) => {
          prev.set(STEP_QUERY_PARAM, String(step));
          if (type) prev.set(TYPE_QUERY_PARAM, type);
          return prev;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (societyId) dispatch(fetchCvuActivationStatus(societyId));
  }, [dispatch, societyId]);

  const hasResumedRef = useRef(vuelveDe4i);
  useEffect(() => {
    if (!hasResumedRef.current && registrationStatus?.currentStep != null) {
      hasResumedRef.current = true;
      goToStep(registrationStatus.currentStep);
    }
  }, [registrationStatus]);

  useEffect(() => {
    if (!vuelveDe4i) return;
    goToStep(CVU_ACTIVATION_STEP.STEP_2, { type: personType });
  }, []);

  return (
    <ActivateAccountCvuLayout
      currentStep={currentStep}
      personType={personType}
      sujetoId={societyId}
      onStepChange={goToStep}
      isLoading={isFetchingStatus}
    />
  );
};

export default ActivateAccountCvu;
