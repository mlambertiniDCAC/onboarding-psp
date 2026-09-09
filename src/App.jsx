import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import styled, { ThemeProvider } from "styled-components";
import { lightTheme } from "./assets/themes";
import { ensureFonts } from "./lib/ensureFonts";
import { setDefaultSociety } from "./slices/profile/profileSlice";
import { resolveRefExterna } from "./bootstrap/resolveRefExterna";
import ActivateAccountCvu from "./features/activateAccountCvu/pages/ActivateAccountCvu";

const Centered = styled.div`
  display: flex;
  min-height: 60vh;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: ${({ theme }) => theme.colors.neutral[600]};
`;

const App = (props) => {
  const dispatch = useDispatch();
  const { search } = useLocation();

  const { refExterna, razonSocial } = resolveRefExterna({ props, search });

  useEffect(() => {
    ensureFonts();
  }, []);

  useEffect(() => {
    if (refExterna) {
      dispatch(
        setDefaultSociety({
          id: refExterna,
          razon_social: razonSocial ?? undefined,
        })
      );
    }
  }, [dispatch, refExterna, razonSocial]);

  return (
    <ThemeProvider theme={lightTheme}>
      {refExterna ? (
        <Routes>
          <Route path="*" element={<ActivateAccountCvu />} />
        </Routes>
      ) : (
        <Centered>
          Falta el identificador del sujeto. Abrí esta pantalla desde el flujo
          de onboarding o agregá <code>?ref=&lt;id&gt;</code> a la URL.
        </Centered>
      )}
    </ThemeProvider>
  );
};

export default App;
