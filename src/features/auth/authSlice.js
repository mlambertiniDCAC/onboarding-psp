import { createSlice } from "@reduxjs/toolkit";
import { authStorage } from "../../lib/authStorage";

const initialState = {
  token: authStorage.getToken(),
  sujetoId: authStorage.getSujetoId(),
  scope: null,
  sujetos: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token, scope, sujetos, sujetoId } = action.payload;
      authStorage.setToken(token);
      authStorage.setSujetoId(sujetoId);
      state.token = token;
      state.sujetoId = sujetoId;
      state.scope = scope ?? null;
      state.sujetos = sujetos ?? [];
    },
    loggedOut: (state) => {
      authStorage.clear();
      state.token = null;
      state.sujetoId = null;
      state.scope = null;
      state.sujetos = [];
    },
  },
});

export const { loginSuccess, loggedOut } = authSlice.actions;
export default authSlice.reducer;
