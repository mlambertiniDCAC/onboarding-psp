import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import profileReducer from "../slices/profile/profileSlice";
import cvuActivationReducer from "../features/activateAccountCvu/store/cvuActivation/cvuActivationSlice";
import authReducer, {
  loginSuccess,
  loggedOut,
} from "../features/auth/authSlice";

const appReducer = combineReducers({
  profile: profileReducer,
  cvuActivation: cvuActivationReducer,
  auth: authReducer,
});

const rootReducer = (state, action) => {
  if (action.type === loginSuccess.type || action.type === loggedOut.type) {
    state = state && { ...state, cvuActivation: undefined };
  }
  return appReducer(state, action);
};

export const persistConfig = {
  key: "onboarding-psp",
  storage,
  whitelist: ["profile"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export default store;
