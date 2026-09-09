export const selectClientProfile = (state) => state.profile.client;

export const selectManagedSocieties = (state) => state.profile.managedSocieties;

export const selectDefaultSocietyId = (state) =>
  state.profile.defaultSociety?.id;

export const selectDefaultSociety = (state) => {
  return state.profile.defaultSociety;
};

export const selectBiometricValidation = (state) =>
  state.profile.biometricValidation;

export const selectSocietyById = (state, societyId) =>
  selectManagedSocieties(state).find((s) => s.id === societyId);

export const selectProfileLoading = (state) => state.profile.loading;

export const selectProfileError = (state) => state.profile.error;

export const selectProfileLastUpdated = (state) => state.profile.lastUpdated;

export const selectClientBasicInfo = (state) => {
  const client = selectClientProfile(state);
  if (!client) return null;

  return {
    fullName: `${client.name} ${client.lastName}`,
    email: client.email,
    phone: client.phone,
    clientType: client.clientType,
  };
};

export const selectPaymentMethodsAvailability = (state) => {
  const society = selectDefaultSociety(state);
  if (!society) return {};

  return {
    thirdPartyPayments: society.enabledThirdPartyPayments,
    checkPayments: society.enabledCheckPayments,
    eCheckPayments: society.enabledECheckPayments,
  };
};

export const selectFinancialOptions = (state) => {
  const society = selectDefaultSociety(state);
  if (!society) return {};

  return {
    financialAdvance: society.financialAdvance,
    zeroRate: society.zeroRate,
    totalAvailability: society.totalAvailability,
  };
};

export const selectProfileStatus = (state) => state.profile.status.data;

export const selectProfileStatusLoading = (state) =>
  state.profile.status.loading;

export const selectProfileStatusError = (state) => state.profile.status.error;

export const selectPhoneValidationStatus = (state) =>
  state.profile.phoneValidation.data;

export const selectPhoneValidationLoading = (state) =>
  state.profile.phoneValidation.loading;

export const selectPhoneVerificationInProcess = (state) => {
  const data = state.profile.phoneValidation.data;
  return !!data && !data.phoneValidated && !data.canRequest;
};
