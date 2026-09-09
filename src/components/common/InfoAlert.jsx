import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { InfoSVG3 } from "src/assets/SVGLibrarie";
import { Typography } from "../Typography";

const VARIANT_STYLES = {
  info: {
    border: (theme) => theme.colors.lightBlue[100],
    background: (theme) => theme.colors.lightBlue[50],
    text: (theme) => theme.colors.lightBlue[900],
    icon: (theme) => theme.colors.lightBlue[500],
  },
  warning: {
    border: (theme) => theme.colors.yellow[200],
    background: (theme) => theme.colors.yellow[50],
    text: (theme) => theme.colors.yellow[900],
    icon: (theme) => theme.colors.yellow[700],
  },
  danger: {
    border: (theme) => theme.colors.red[200],
    background: (theme) => theme.colors.red[50],
    text: (theme) => theme.colors.red[900],
    icon: (theme) => theme.colors.red[700],
  },
  success: {
    border: (theme) => theme.colors.green[200],
    background: (theme) => theme.colors.green[50],
    text: (theme) => theme.colors.green[900],
    icon: (theme) => theme.colors.green[700],
  },
};

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  border: 1.5px solid
    ${({ theme, $variant }) => VARIANT_STYLES[$variant].border(theme)};
  background: ${({ theme, $variant }) =>
    VARIANT_STYLES[$variant].background(theme)};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

/**
 * InfoAlert — mensaje informativo con título y descripción opcional.
 *
 * @param {Object} props
 * @param {string} props.title - Texto principal del aviso.
 * @param {string} [props.description] - Texto secundario opcional.
 * @param {"info" | "warning" | "danger" | "success"} [props.variant="info"]
 * @param {React.ReactNode} [props.icon] - Icono opcional.
 */
export const InfoAlert = ({ title, description, variant = "info", icon }) => {
  const theme = useTheme();
  const styles = VARIANT_STYLES[variant];

  return (
    <Container $variant={variant}>
      {icon ?? <InfoSVG3 fill={styles.icon(theme)} />}
      <Content>
        <Typography
          variant="small"
          fontWeight="bold"
          fontStyle="italic"
          color={styles.text(theme)}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="tiny"
            fontStyle="italic"
            color={styles.text(theme)}
          >
            {description}
          </Typography>
        )}
      </Content>
    </Container>
  );
};

InfoAlert.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  variant: PropTypes.oneOf(["info", "warning", "danger", "success"]),
  icon: PropTypes.node,
};

export default InfoAlert;
