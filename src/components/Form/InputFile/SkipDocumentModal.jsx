import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { WarningSVG, InfoSVG, CheckSVG } from "src/assets/SVGLibrarie";
import { Button } from "components/Button";
import Modal from "components/Modal/Modal";
import { InputText } from "../InputText";
import { SkipDocumentDefaultBody } from "./SkipDocumentDefaultBody";

const SKIP_REASON_FIELD = "skipReason";

// Borde del pictograma de aviso (Border/Notice). No existe token equivalente en el theme.
const NOTICE_BORDER_COLOR = "#F7CCB0";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 560px;
  max-width: 100%;
  padding: 0 32px 32px;
  box-sizing: border-box;
`;

const Slot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  padding: 40px;
  box-sizing: border-box;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.neutral[0]};
`;

const Pictogram = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 999px;
  background: ${({ $bg }) => $bg};
  border: 4px solid ${({ $border }) => $border};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const SEVERITY = {
  NOTICE: "notice",
  WARNING: "warning",
  ERROR: "error",
  SUCCESS: "success",
  INFO: "info",
};

/**
 * SkipDocumentModal — modal de omisión de documento que pide un motivo obligatorio.
 * Usa el `Modal.jsx` compartido como wrapper y suma el pictograma, el cuerpo y el input
 * de motivo con su validación. Customizable en título, severidad y cuerpo.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {string} [props.title] - Título del header (default: "Omitir documento").
 * @param {"notice"|"warning"|"error"|"success"|"info"} [props.severity] - Severidad del
 *   pictograma (default: "notice").
 * @param {React.ReactNode} [props.body] - Cuerpo customizable; por defecto la pregunta y
 *   descripción del diseño.
 * @param {string} [props.defaultReason] - Motivo precargado (p. ej. desde un draft).
 * @param {(reason: string) => void} props.onConfirm - Confirma la omisión con el motivo.
 * @param {Function} props.onCancel - Cancela ("Tengo el documento" o cruz).
 */
export const SkipDocumentModal = ({
  open,
  title = "Omitir documento",
  severity = SEVERITY.NOTICE,
  body,
  defaultReason = "",
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();
  const [reason, setReason] = useState(defaultReason);

  // Sincroniza el motivo precargado cada vez que se abre el modal.
  useEffect(() => {
    if (open) setReason(defaultReason);
  }, [open, defaultReason]);

  const severityConfig = {
    [SEVERITY.NOTICE]: {
      bg: theme.colors.orange[500],
      border: NOTICE_BORDER_COLOR,
      Icon: WarningSVG,
    },
    [SEVERITY.WARNING]: {
      bg: theme.colors.orange[500],
      border: NOTICE_BORDER_COLOR,
      Icon: WarningSVG,
    },
    [SEVERITY.ERROR]: {
      bg: theme.colors.red[500],
      border: theme.colors.red[100],
      Icon: WarningSVG,
    },
    [SEVERITY.SUCCESS]: {
      bg: theme.colors.green[500],
      border: theme.colors.green[100],
      Icon: CheckSVG,
    },
    [SEVERITY.INFO]: {
      bg: theme.colors.lightBlue[500],
      border: theme.colors.lightBlue[100],
      Icon: InfoSVG,
    },
  };

  const { bg, border, Icon } =
    severityConfig[severity] ?? severityConfig[SEVERITY.NOTICE];

  const trimmedReason = reason.trim();

  const handleConfirm = () => {
    if (!trimmedReason) return;
    onConfirm(trimmedReason);
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      backgroundColor={theme.colors.neutral[50]}
    >
      <Content>
        <Slot>
          <Pictogram $bg={bg} $border={border}>
            <Icon width="32" height="32" fill={theme.colors.neutral[0]} />
          </Pictogram>
          {body ?? <SkipDocumentDefaultBody />}
          <InputText
            name={SKIP_REASON_FIELD}
            value={reason}
            onChange={(_name, val) => setReason(val)}
            placeholder="Ingresá el motivo acá..."
            enabledBorder
          />
        </Slot>

        <Actions>
          <Button tone="brand" role="tertiary" type="button" onClick={onCancel}>
            Tengo el documento
          </Button>
          <Button
            tone="brand"
            role="primary"
            type="button"
            disabled={!trimmedReason}
            onClick={handleConfirm}
          >
            Omitir documento
          </Button>
        </Actions>
      </Content>
    </Modal>
  );
};

SkipDocumentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  severity: PropTypes.oneOf(Object.values(SEVERITY)),
  body: PropTypes.node,
  defaultReason: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default SkipDocumentModal;
