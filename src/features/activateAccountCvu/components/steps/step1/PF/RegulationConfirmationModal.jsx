import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { CloseCrossSVG, WarningSVG } from "src/assets/SVGLibrarie";
import { Button } from "components/Button";
import { Typography } from "components/Typography";
import { useLockBodyScroll } from "src/hooks/useLockBodyScroll";

// Borde del pictograma de aviso (Border/Notice). No existe token equivalente en el theme.
const NOTICE_BORDER_COLOR = "#F7CCB0";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.4);
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 560px;
  max-width: 100%;
  padding: 32px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.neutral[50]};
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 24px;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
`;

const Slot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  padding: 40px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.neutral[0]};
`;

const Pictogram = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.orange[500]};
  border: 4px solid ${NOTICE_BORDER_COLOR};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

/**
 * Modal de confirmación que se dispara al marcar una regulación que lo requiere
 * (Sujeto obligado o Persona Expuesta Políticamente). Sigue el diseño de Figma
 * node 331-91174 / 331-91208.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {string} [props.question]
 * @param {Function} props.onConfirm - el usuario confirma la regulación ("Sí, soy").
 * @param {Function} props.onCancel - el usuario rechaza o cierra el modal ("No, no soy" / cruz).
 */
export const RegulationConfirmationModal = ({
  open,
  question,
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        onCancel();
      }
    },
    [onCancel]
  );

  const handleOverlayClick = useCallback(
    (event) => {
      if (event.target === event.currentTarget) {
        onCancel();
      }
    },
    [onCancel]
  );

  useEffect(() => {
    if (!open) return undefined;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  useLockBodyScroll(open);

  if (!open) return null;

  return createPortal(
    <Overlay onClick={handleOverlayClick}>
      <Panel>
        <TopBar>
          <CloseButton type="button" aria-label="Cerrar" onClick={onCancel}>
            <CloseCrossSVG
              width="24"
              height="24"
              fill={theme.colors.neutral[500]}
            />
          </CloseButton>
        </TopBar>

        <Slot>
          <Pictogram>
            <WarningSVG width="32" height="32" fill={theme.colors.neutral[0]} />
          </Pictogram>
          <Typography
            variant="regular"
            fontWeight="bold"
            color={theme.colors.neutral[700]}
            textAlign="center"
          >
            {question}
          </Typography>
        </Slot>

        <Actions>
          <Button
            tone="brand"
            role="tertiary"
            type="button"
            onClick={onConfirm}
          >
            Sí, soy
          </Button>
          <Button tone="brand" role="primary" type="button" onClick={onCancel}>
            No, no soy
          </Button>
        </Actions>
      </Panel>
    </Overlay>,
    document.body
  );
};

RegulationConfirmationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  question: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RegulationConfirmationModal;
