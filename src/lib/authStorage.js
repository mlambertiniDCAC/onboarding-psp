const TOKEN_KEY = "onboarding_psp_token";
const SUJETO_ID_KEY = "onboarding_psp_sujeto_id";

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  getSujetoId: () => localStorage.getItem(SUJETO_ID_KEY),
  setSujetoId: (sujetoId) => localStorage.setItem(SUJETO_ID_KEY, sujetoId),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SUJETO_ID_KEY);
  },
};
