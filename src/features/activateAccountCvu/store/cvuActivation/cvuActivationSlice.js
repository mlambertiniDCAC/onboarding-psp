import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCvuActivationStatus,
  fetchLegalConditionStep,
  fetchSocietyTypeStep,
  fetchDocumentationStep,
  fetchPersonalInfoStep,
  fetchTermsStep,
  saveDraftStep,
  createDraft,
} from "./cvuActivationActions";

const INITIAL_DOCUMENTATION_OPTIONS = {
  documents: [],
  apoderado: null,
  pep: null,
};

const INITIAL_STEP_DATA = {
  step0: null,
  step1: null,
  step2: null,
  step3: null,
};

const cvuActivationSlice = createSlice({
  name: "cvuActivation",
  initialState: {
    registrationStatus: null,
    stepData: INITIAL_STEP_DATA,
    hasExistingDraft: false,
    legalConditionOptions: [],
    societyTypeOptions: [],
    isFetchingStatus: false,
    isFetchingLegalCondition: false,
    legalConditionError: null,
    isFetchingSocietyType: false,
    societyTypeError: null,
    documentationOptions: INITIAL_DOCUMENTATION_OPTIONS,
    isFetchingDocumentation: false,
    documentationError: null,
    occupationOptions: [],
    isFetchingPersonalInfo: false,
    personalInfoError: null,
    termsInputType: null,
    isFetchingTerms: false,
    termsError: null,
    isSubmitting: false,
    submitError: null,
    error: null,
  },
  reducers: {
    setStepData: (state, action) => {
      const { step, data } = action.payload;
      state.stepData[`step${step}`] = data;
    },
    setIsSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
    clearCvuActivation: (state) => {
      state.registrationStatus = null;
      state.stepData = INITIAL_STEP_DATA;
      state.hasExistingDraft = false;
      state.legalConditionOptions = [];
      state.legalConditionError = null;
      state.societyTypeOptions = [];
      state.societyTypeError = null;
      state.documentationOptions = INITIAL_DOCUMENTATION_OPTIONS;
      state.documentationError = null;
      state.occupationOptions = [];
      state.personalInfoError = null;
      state.termsInputType = null;
      state.termsError = null;
      state.submitError = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCvuActivationStatus.pending, (state) => {
        state.isFetchingStatus = true;
        state.error = null;
      })
      .addCase(fetchCvuActivationStatus.fulfilled, (state, action) => {
        const { stepData, hasExistingDraft, ...registrationStatus } =
          action.payload;
        state.isFetchingStatus = false;
        state.registrationStatus = registrationStatus;
        state.stepData = { ...state.stepData, ...stepData };
        state.hasExistingDraft = hasExistingDraft;
      })
      .addCase(fetchCvuActivationStatus.rejected, (state, action) => {
        state.isFetchingStatus = false;
        state.error = action.payload;
      })
      .addCase(fetchLegalConditionStep.pending, (state) => {
        state.isFetchingLegalCondition = true;
        state.legalConditionError = null;
      })
      .addCase(fetchLegalConditionStep.fulfilled, (state, action) => {
        state.isFetchingLegalCondition = false;
        state.legalConditionOptions = action.payload;
      })
      .addCase(fetchLegalConditionStep.rejected, (state, action) => {
        state.isFetchingLegalCondition = false;
        state.legalConditionError = action.payload;
      })
      .addCase(fetchSocietyTypeStep.pending, (state) => {
        state.isFetchingSocietyType = true;
        state.societyTypeError = null;
      })
      .addCase(fetchSocietyTypeStep.fulfilled, (state, action) => {
        state.isFetchingSocietyType = false;
        state.societyTypeOptions = action.payload;
      })
      .addCase(fetchSocietyTypeStep.rejected, (state, action) => {
        state.isFetchingSocietyType = false;
        state.societyTypeError = action.payload;
      })
      .addCase(fetchDocumentationStep.pending, (state) => {
        state.isFetchingDocumentation = true;
        state.documentationError = null;
      })
      .addCase(fetchDocumentationStep.fulfilled, (state, action) => {
        state.isFetchingDocumentation = false;
        state.documentationOptions = action.payload;
      })
      .addCase(fetchDocumentationStep.rejected, (state, action) => {
        state.isFetchingDocumentation = false;
        state.documentationError = action.payload;
      })
      .addCase(fetchPersonalInfoStep.pending, (state) => {
        state.isFetchingPersonalInfo = true;
        state.personalInfoError = null;
      })
      .addCase(fetchPersonalInfoStep.fulfilled, (state, action) => {
        state.isFetchingPersonalInfo = false;
        state.occupationOptions = action.payload;
      })
      .addCase(fetchPersonalInfoStep.rejected, (state, action) => {
        state.isFetchingPersonalInfo = false;
        state.personalInfoError = action.payload;
      })
      .addCase(fetchTermsStep.pending, (state) => {
        state.isFetchingTerms = true;
        state.termsError = null;
      })
      .addCase(fetchTermsStep.fulfilled, (state, action) => {
        state.isFetchingTerms = false;
        state.termsInputType = action.payload;
      })
      .addCase(fetchTermsStep.rejected, (state, action) => {
        state.isFetchingTerms = false;
        state.termsError = action.payload;
      })
      .addCase(saveDraftStep.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(saveDraftStep.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(saveDraftStep.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload;
      })
      .addCase(createDraft.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(createDraft.fulfilled, (state) => {
        state.isSubmitting = false;
        // Ya existe el draft: los guardados siguientes van por PUT.
        state.hasExistingDraft = true;
      })
      .addCase(createDraft.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload;
      });
  },
});

export const { setStepData, setIsSubmitting, clearCvuActivation } =
  cvuActivationSlice.actions;
export default cvuActivationSlice.reducer;
