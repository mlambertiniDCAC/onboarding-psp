import { createSlice } from "@reduxjs/toolkit";
import { authStorage } from "../../lib/authStorage";

const initialState = {
  token: authStorage.getToken(),
  scope: null,
  sujetos: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token, scope, sujetos } = action.payload;
      authStorage.setToken(token);
      state.token = token;
      state.scope = scope ?? null;
      state.sujetos = sujetos ?? [];
    },
    loggedOut: (state) => {
      authStorage.clear();
      state.token = null;
      state.scope = null;
      state.sujetos = [];
    },
  },
});

export const { loginSuccess, loggedOut } = authSlice.actions;
export default authSlice.reducer;
