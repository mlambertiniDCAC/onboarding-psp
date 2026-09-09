import { useTheme } from "styled-components";
import { Typography } from "components/Typography";

const DEFAULT_QUESTION = "¿Estás seguro de omitir el documento?";
const DEFAULT_DESCRIPTION =
  "Si no contás con este documento en este momento, podés omitirlo para continuar con el proceso de alta de tu cuenta pero necesitamos que nos indiques el motivo de dicha omisión.";

/**
 * SkipDocumentDefaultBody — cuerpo por defecto del modal de omisión (pregunta + descripción).
 * Se extrae del modal para no declarar componentes antes del componente principal.
 */
export const SkipDocumentDefaultBody = () => {
  const theme = useTheme();

  return (
    <>
      <Typography
        variant="regular"
        fontWeight="bold"
        color={theme.colors.neutral[700]}
        textAlign="center"
      >
        {DEFAULT_QUESTION}
      </Typography>
      <Typography
        variant="small"
        color={theme.colors.neutral[700]}
        textAlign="center"
      >
        {DEFAULT_DESCRIPTION}
      </Typography>
    </>
  );
};

export default SkipDocumentDefaultBody;
