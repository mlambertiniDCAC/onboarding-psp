import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import profileReducer from "../slices/profile/profileSlice";
import cvuActivationReducer from "../features/activateAccountCvu/store/cvuActivation/cvuActivationSlice";

const rootReducer = combineReducers({
  profile: profileReducer,
  cvuActivation: cvuActivationReducer,
});

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
