import { createSelector } from "reselect";

const selectCvuActivationState = (state) => state.cvuActivation;

export const selectRegistrationStatus = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.registrationStatus
);

export const selectStepData = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.stepData
);

export const selectHasExistingDraft = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.hasExistingDraft
);

export const selectIsFetchingStatus = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.isFetchingStatus
);

export const selectIsSubmitting = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.isSubmitting
);

export const selectCvuActivationError = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.error
);

export const selectLegalConditionOptions = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.legalConditionOptions
);

export const selectIsFetchingLegalCondition = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.isFetchingLegalCondition
);

export const selectLegalConditionError = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.legalConditionError
);

export const selectSubmitError = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.submitError
);

export const selectSocietyTypeOptions = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.societyTypeOptions
);

export const selectIsFetchingSocietyType = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.isFetchingSocietyType
);

export const selectSocietyTypeError = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.societyTypeError
);

export const selectDocumentationOptions = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.documentationOptions
);

export const selectIsFetchingDocumentation = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.isFetchingDocumentation
);

export const selectDocumentationError = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.documentationError
);

export const selectOccupationOptions = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.occupationOptions
);

export const selectIsFetchingPersonalInfo = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.isFetchingPersonalInfo
);

export const selectPersonalInfoError = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.personalInfoError
);

export const selectTermsInputType = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.termsInputType
);

export const selectIsFetchingTerms = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.isFetchingTerms
);

export const selectTermsError = createSelector(
  selectCvuActivationState,
  (cvuActivation) => cvuActivation.termsError
);
