import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import Modal from "components/Modal/Modal";
import { CheckSVG } from "src/assets/SVGLibrarie";
import { Button } from "components/Button";
import { Typography } from "components/Typography";
import { color } from "src/assets/themes";

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 32px 32px;
  /* Ancho total del modal (640px). El componente Modal solo fija min-width, así
     que sin esto el párrafo largo estira el panel. box-sizing incluye el padding. */
  box-sizing: border-box;
  width: 640px;
  max-width: 100%;
`;

const Slot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 32px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.neutral[0]};
`;

const Pictogram = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.green[100]};
`;

const PictogramInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.green[500]};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

/**
 * Modal de confirmación que se muestra al completar el paso final (T&C) del alta
 * de cuenta CVU. Sigue el diseño de Figma node 297-95401 y reutiliza el componente
 * `Modal` compartido (portal, overlay, cierre por cruz/Escape/overlay). El cierre
 * ("Entendido" o la cruz) lo resuelve el padre (típicamente, navegar al Inicio).
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose - cerrar el modal (cruz, Escape, click en overlay o "Entendido").
 */
export const RegistrationSuccessModal = ({ open, onClose }) => {
  const theme = useTheme();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Documentación requerida"
      minWidth="640px"
      backgroundColor={color.neutral[50]}
    >
      <Body>
        <Slot>
          <Pictogram>
            <PictogramInner>
              <CheckSVG width="32" height="32" fill={theme.colors.neutral[0]} />
            </PictogramInner>
          </Pictogram>
          <Typography
            variant="regular"
            fontWeight="bold"
            color={theme.colors.neutral[700]}
            textAlign="center"
          >
            Documentación enviada
          </Typography>
          <Typography
            variant="small"
            color={theme.colors.neutral[700]}
            textAlign="center"
          >
            Gracias por enviarnos la documentación solicitada. Nuestro equipo va
            a revisarla y pronto nos pondremos en contacto con usted.
          </Typography>
        </Slot>

        <Actions>
          <Button tone="brand" role="primary" type="button" onClick={onClose}>
            Entendido
          </Button>
        </Actions>
      </Body>
    </Modal>
  );
};

RegistrationSuccessModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RegistrationSuccessModal;
