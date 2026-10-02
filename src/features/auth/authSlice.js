import { createSlice } from "@reduxjs/toolkit";
import { authStorage } from "../../lib/authStorage";

const initialState = {
  token: authStorage.getToken(),
  sujetoId: authStorage.getSujetoId(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token, sujetoId } = action.payload;
      authStorage.setToken(token);
      authStorage.setSujetoId(sujetoId);
      state.token = token;
      state.sujetoId = sujetoId;
    },
    loggedOut: (state) => {
      authStorage.clear();
      state.token = null;
      state.sujetoId = null;
    },
  },
});

export const { loginSuccess, loggedOut } = authSlice.actions;
export default authSlice.reducer;
