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
  const [currentStep, setCurrentStep] = useState(() =>
    parseStepFromUrl(searchParams)
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

  // Reanuda en el paso guardado por el back, pero solo la primera vez: los refreshes
  // posteriores del status (p. ej. tras guardar un paso) no deben reubicar al usuario.
  const hasResumedRef = useRef(false);
  useEffect(() => {
    if (!hasResumedRef.current && registrationStatus?.currentStep != null) {
      hasResumedRef.current = true;
      goToStep(registrationStatus.currentStep);
    }
  }, [registrationStatus]);

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
