import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  client: null,
  managedSocieties: [],
  defaultSociety: null,
  biometricValidation: null,
  loading: true,
  error: null,
  lastUpdated: null,
  status: { data: null, loading: true, error: null, lastUpdated: null },
  phoneValidation: {
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
  },
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setDefaultSociety: (state, action) => {
      state.defaultSociety = action.payload;
    },
    resetProfile: () => initialState,
    clearProfileStatus: (state) => {
      state.status = {
        data: null,
        loading: true,
        error: null,
        lastUpdated: null,
      };
    },
    updateClientData: (state, action) => {
      if (state.client) {
        state.client = { ...state.client, ...action.payload };
      }
    },
    setPhoneVerificationInProcess: (state) => {
      if (state.phoneValidation.data) {
        state.phoneValidation.data.canRequest = false;
      } else {
        state.phoneValidation.data = {
          phoneValidated: false,
          canRequest: false,
        };
      }
    },
  },
});

export const {
  updateClientData,
  setDefaultSociety,
  resetProfile,
  clearProfileStatus,
  setPhoneVerificationInProcess,
} = profileSlice.actions;
export default profileSlice.reducer;
