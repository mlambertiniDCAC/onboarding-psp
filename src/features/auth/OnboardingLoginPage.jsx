import { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { Typography } from "src/components/Typography";
import { Button } from "src/components/Button";
import axiosInstance from "src/lib/axiosInstance";
import { setDefaultSociety } from "src/slices/profile/profileSlice";
import { loginSuccess } from "./authSlice";

const OPERADOR_NOMBRE = "Operador";
const OPERADOR_APELLIDO = "Interno";

const Wrapper = styled.div`
  display: flex;
  min-height: 60vh;
  align-items: center;
  justify-content: center;
`;

const Card = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 320px;
  padding: 32px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};

  input {
    height: 40px;
    padding: 0 12px;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const validationSchema = Yup.object().shape({
  mail: Yup.string().email("Mail inválido").required("Ingresá el mail"),
  sujetoId: Yup.string().required("Ingresá el sujetoId"),
});

const OnboardingLoginPage = () => {
  const dispatch = useDispatch();
  const [apiError, setApiError] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    setApiError(null);
    try {
      const response = await axiosInstance.post("/v1/auth/onboarding", {
        mail: values.mail,
        sujetoId: values.sujetoId,
        nombre: OPERADOR_NOMBRE,
        apellido: OPERADOR_APELLIDO,
      });
      dispatch(loginSuccess({ ...response.data, sujetoId: values.sujetoId }));
      dispatch(setDefaultSociety({ id: values.sujetoId }));
    } catch (error) {
      setApiError(
        error.response?.data?.message || "No se pudo abrir la sesión."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Wrapper>
      <Formik
        initialValues={{ mail: "", sujetoId: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit: formikSubmit,
          isSubmitting,
        }) => (
          <Card onSubmit={formikSubmit}>
            <Typography variant="h3">onboarding-psp</Typography>
            <Field>
              <Typography variant="small">Mail</Typography>
              <input
                type="email"
                name="mail"
                value={values.mail}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.mail && errors.mail && (
                <Typography variant="small" color="#c0392b">
                  {errors.mail}
                </Typography>
              )}
            </Field>
            <Field>
              <Typography variant="small">Sociedad_ID</Typography>
              <input
                type="text"
                name="sujetoId"
                value={values.sujetoId}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.sujetoId && errors.sujetoId && (
                <Typography variant="small" color="#c0392b">
                  {errors.sujetoId}
                </Typography>
              )}
            </Field>
            {apiError && (
              <Typography variant="small" color="#c0392b">
                {apiError}
              </Typography>
            )}
            <Button
              tone="brand"
              role="primary"
              type="submit"
              disabled={isSubmitting}
            >
              Ingresar
            </Button>
          </Card>
        )}
      </Formik>
    </Wrapper>
  );
};

export default OnboardingLoginPage;
