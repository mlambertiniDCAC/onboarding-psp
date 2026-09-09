import { useRef, useState } from "react";
import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import {
  UploadFileSVG,
  FileCheckSVG,
  ClockSVG,
  TrashSVG,
  DownloadSVG2,
  InfoSVG3,
  CheckCircleFilledSVG,
} from "assets/SVGLibrarie";
import { Typography } from "../../Typography";
import { Checkbox } from "../Checkbox";
import ErrorMessage from "../ErrorMessage";
import { SkipDocumentModal } from "./SkipDocumentModal";

const BYTES_PER_MB = 1024 * 1024;

const FILE_STATE = {
  EMPTY: "empty",
  LOADED: "loaded",
  SKIPPED: "skipped",
};

const SKIP_FIELD = "skip";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const Box = styled.div`
  display: flex;
  flex: 1 0 0;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  border: ${({ $state, $isDragging, theme }) => {
    if ($state === FILE_STATE.LOADED) {
      return `1px solid ${theme.colors.green[100]}`;
    }
    if ($state === FILE_STATE.SKIPPED) {
      return `1px solid ${theme.colors.neutral[300]}`;
    }
    return `1px dashed ${
      $isDragging ? theme.colors.lightBlue[600] : theme.colors.lightBlue[500]
    }`;
  }};
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 24px 16px;
  box-sizing: border-box;
  background-color: ${({ $state, $isDragging, theme }) => {
    if ($state === FILE_STATE.LOADED) return theme.colors.green[50];
    if ($state === FILE_STATE.SKIPPED) return theme.colors.neutral[100];
    return $isDragging ? theme.colors.lightBlue[50] : theme.colors.neutral[0];
  }};
  cursor: ${({ $interactive }) => ($interactive ? "pointer" : "default")};
`;

const RightTitle = styled(Typography)`
  flex: 1 0 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Footer = styled.div`
  display: flex;
  width: 100%;
  padding: 8px 16px;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const SkipReasonFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.neutral[0]};
`;

const ReasonBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  padding: 4px 8px 4px 4px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.lightBlue[50]};
  border: 1px solid ${({ theme }) => theme.colors.lightBlue[100]};
`;

const BadgeIcon = styled.div`
  display: flex;
  flex-shrink: 0;
  margin-right: 4px;
`;

const LoadedFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.neutral[0]};
`;

const FileBadge = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 4px 8px 4px 4px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.green[50]};
  border: 1px solid ${({ theme }) => theme.colors.green[100]};
`;

const BadgeText = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const HiddenInput = styled.input`
  display: none;
`;

const isFileAccepted = (file, accept) => {
  if (!accept) return true;

  const tokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  if (!tokens.length) return true;

  const fileName = file.name?.toLowerCase() ?? "";
  const fileType = file.type?.toLowerCase() ?? "";

  return tokens.some((token) => {
    if (token.startsWith(".")) return fileName.endsWith(token);
    if (token.endsWith("/*")) return fileType.startsWith(token.slice(0, -1));
    return fileType === token;
  });
};

// El valor puede ser un File (recién cargado) o un descriptor del backend
// (draft): un string con la URL o un objeto { name, url }.
const getFileName = (file) => {
  if (!file) return "";
  if (file instanceof File) return file.name;
  if (typeof file === "string") return file.split("/").pop();
  return file.name ?? file.fileName ?? "";
};

const getFileUrl = (file) => {
  if (!file || file instanceof File) return null;
  if (typeof file === "string") return file;
  return file.url ?? file.href ?? null;
};

const triggerDownload = (href, name) => {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name || "documento";
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

const downloadFile = (file) => {
  const objectUrl = URL.createObjectURL(file);
  triggerDownload(objectUrl, file.name);
  URL.revokeObjectURL(objectUrl);
};

/**
 * InputFile — campo genérico de carga de un único archivo (drag & drop o selección).
 *
 * @param {Object} props
 * @param {string} props.title - Texto en negrita posicionado a la derecha.
 * @param {string} [props.description] - Texto a la izquierda en estado vacío (default: `Adjuntar {formatLabel}`).
 * @param {string} [props.accept] - Formatos admitidos para el input file (default: PDF).
 * @param {string} [props.formatLabel] - Etiqueta visible del formato (default: "PDF").
 * @param {number} [props.maxSizeMB] - Peso máximo en MB (default: 10).
 * @param {boolean} [props.allowSkip] - Habilita el checkbox "Omitir documento".
 * @param {string} [props.skipLabel] - Texto del checkbox de omisión.
 * @param {File|string|{name?: string, url?: string}} [props.value] - Valor controlado:
 *   un File recién cargado o un descriptor del backend (URL o `{ name, url }`).
 * @param {File|string|{name?: string, url?: string}} [props.defaultValue] - Valor inicial no
 *   controlado, p. ej. un documento ya cargado en un draft del backend.
 * @param {boolean} [props.skipped] - Estado de omisión (uso controlado).
 * @param {string} [props.skipReason] - Motivo de omisión (uso controlado; pisa el interno).
 * @param {boolean} [props.defaultSkipped] - Estado de omisión inicial no controlado (draft).
 * @param {string} [props.defaultSkipReason] - Motivo de omisión inicial (draft).
 * @param {(file: File|null) => void|Promise} props.onSubmit - Setter o función async al cargar/eliminar.
 * @param {(skipped: boolean, reason: string) => void} [props.onSkipChange] - Callback al togglear
 *   omisión; `reason` trae el motivo ingresado (string vacío al des-omitir).
 * @param {(file: File|string|object) => void} [props.onDownload] - Sobrescribe la descarga por defecto
 *   (necesario si el backend expone la descarga vía endpoint en lugar de una URL directa).
 * @param {boolean} [props.showDownload] - Muestra el botón de descarga en el estado cargado (default: true).
 * @param {boolean} [props.downloadDisabled] - Deshabilita solo el botón de descarga (default: false).
 * @param {boolean} [props.disabled] - Deshabilita la interacción.
 * @param {string} [props.error] - Mensaje de error externo.
 * @param {string} [props.skipModalTitle] - Título del modal de omisión.
 * @param {"notice"|"warning"|"error"|"success"|"info"} [props.skipModalSeverity] - Severidad
 *   del pictograma del modal de omisión.
 * @param {React.ReactNode} [props.skipModalBody] - Cuerpo customizable del modal de omisión.
 * @param {string} [props.className]
 */
export const InputFile = ({
  title,
  description,
  accept = "application/pdf,.pdf",
  formatLabel = "PDF",
  maxSizeMB = 10,
  allowSkip = false,
  skipLabel = "Omitir documento",
  value,
  defaultValue = null,
  skipped: skippedProp,
  skipReason: skipReasonProp,
  defaultSkipped = false,
  defaultSkipReason = "",
  onSubmit,
  onSkipChange,
  onDownload,
  showDownload = true,
  downloadDisabled = false,
  disabled = false,
  error,
  skipModalTitle,
  skipModalSeverity,
  skipModalBody,
  className,
}) => {
  const theme = useTheme();
  const inputRef = useRef(null);

  const [internalFile, setInternalFile] = useState(defaultValue);
  const [internalSkipped, setInternalSkipped] = useState(defaultSkipped);
  const [internalSkipReason, setInternalSkipReason] =
    useState(defaultSkipReason);
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [internalError, setInternalError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const file = value !== undefined ? value : internalFile;
  const skipped = skippedProp !== undefined ? skippedProp : internalSkipped;
  const skipReason =
    skipReasonProp !== undefined ? skipReasonProp : internalSkipReason;
  const fileName = getFileName(file);

  const state = file
    ? FILE_STATE.LOADED
    : skipped
      ? FILE_STATE.SKIPPED
      : FILE_STATE.EMPTY;

  const canInteract = !disabled && state === FILE_STATE.EMPTY;

  const processFile = async (incomingFile) => {
    if (!incomingFile) return;

    if (!isFileAccepted(incomingFile, accept)) {
      setInternalError(
        `Formato no admitido. Solo se permiten archivos ${formatLabel}.`
      );
      return;
    }

    if (incomingFile.size > maxSizeMB * BYTES_PER_MB) {
      setInternalError(`El archivo supera el peso máximo de ${maxSizeMB}MB.`);
      return;
    }

    setInternalError(null);
    setInternalFile(incomingFile);

    try {
      await onSubmit(incomingFile);
    } catch (submitError) {
      setInternalFile(null);
      setInternalError(
        submitError?.message ||
          "No se pudo cargar el archivo. Intentá nuevamente."
      );
    }
  };

  const handleSelectClick = () => {
    if (!canInteract) return;
    inputRef.current?.click();
  };

  const handleInputChange = (event) => {
    processFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDragOver = (event) => {
    if (!canInteract) return;
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    if (!canInteract) return;
    event.preventDefault();
    setIsDragging(false);
    processFile(event.dataTransfer.files?.[0]);
  };

  const handleDelete = async () => {
    setInternalError(null);
    setInternalFile(null);
    await onSubmit(null);
  };

  const handleDownload = () => {
    if (!file) return;
    if (onDownload) {
      onDownload(file);
      return;
    }
    if (file instanceof File) {
      downloadFile(file);
      return;
    }
    const url = getFileUrl(file);
    if (url) triggerDownload(url, fileName);
  };

  const applySkip = (nextSkipped, reason) => {
    if (skippedProp === undefined) setInternalSkipped(nextSkipped);
    if (skipReasonProp === undefined) setInternalSkipReason(reason);
    onSkipChange?.(nextSkipped, reason);
  };

  const handleSkipChange = (_name, checked) => {
    // Marcar omisión requiere ingresar un motivo en el modal; desmarcar es directo.
    if (checked) {
      setIsSkipModalOpen(true);
    } else {
      applySkip(false, "");
    }
  };

  const handleConfirmSkip = (reason) => {
    applySkip(true, reason);
    setIsSkipModalOpen(false);
  };

  const handleCancelSkip = () => setIsSkipModalOpen(false);

  const leftIcon = {
    [FILE_STATE.EMPTY]: <UploadFileSVG fill={theme.colors.lightBlue[500]} />,
    [FILE_STATE.LOADED]: <FileCheckSVG fill={theme.colors.green[900]} />,
    [FILE_STATE.SKIPPED]: <ClockSVG fill={theme.colors.neutral[500]} />,
  }[state];

  const leftText = {
    [FILE_STATE.EMPTY]: description ?? `Adjuntar ${formatLabel}`,
    [FILE_STATE.LOADED]: `${formatLabel} Adjunto`,
    [FILE_STATE.SKIPPED]: "Omitido",
  }[state];

  const contentColor = {
    [FILE_STATE.EMPTY]: theme.colors.lightBlue[500],
    [FILE_STATE.LOADED]: theme.colors.green[900],
    [FILE_STATE.SKIPPED]: theme.colors.neutral[500],
  }[state];

  const showCheckboxFooter = allowSkip && state === FILE_STATE.EMPTY;
  const showSkipReasonFooter = allowSkip && state === FILE_STATE.SKIPPED;

  return (
    <Wrapper className={className}>
      <InputRow>
        <Box $state={state} $isDragging={isDragging}>
          <Content
            $state={state}
            $isDragging={isDragging}
            $interactive={canInteract}
            title={state === FILE_STATE.LOADED ? fileName : undefined}
            onClick={handleSelectClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {leftIcon}
            <Typography variant="small" color={contentColor}>
              {leftText}
            </Typography>
            <RightTitle
              variant="small"
              fontWeight="bold"
              color={contentColor}
              textAlign="right"
            >
              {title}
            </RightTitle>
          </Content>
          {showCheckboxFooter && (
            <Footer>
              <Checkbox
                name={SKIP_FIELD}
                label={skipLabel}
                checked={skipped}
                onChange={handleSkipChange}
              />
            </Footer>
          )}
          {showSkipReasonFooter && (
            <SkipReasonFooter>
              {skipReason && (
                <ReasonBadge>
                  <BadgeIcon>
                    <InfoSVG3
                      width="16"
                      height="16"
                      fill={theme.colors.lightBlue[500]}
                    />
                  </BadgeIcon>
                  <Typography
                    variant="tiny"
                    fontWeight="bold"
                    color={theme.colors.lightBlue[900]}
                  >
                    Motivo: {skipReason}
                  </Typography>
                </ReasonBadge>
              )}
              <ActionButton
                type="button"
                onClick={() => applySkip(false, "")}
                aria-label="Quitar omisión"
                disabled={disabled}
              >
                <TrashSVG width="20" height="20" fill={theme.colors.red[500]} />
              </ActionButton>
            </SkipReasonFooter>
          )}
          {state === FILE_STATE.LOADED && (
            <LoadedFooter>
              <FileBadge>
                <BadgeIcon>
                  <CheckCircleFilledSVG
                    width="16"
                    height="16"
                    fill={theme.colors.green[600]}
                  />
                </BadgeIcon>
                <BadgeText
                  variant="tiny"
                  fontWeight="bold"
                  color={theme.colors.green[900]}
                >
                  {fileName}
                </BadgeText>
              </FileBadge>
              <FooterActions>
                {showDownload && (
                  <ActionButton
                    type="button"
                    onClick={handleDownload}
                    aria-label="Descargar documento"
                    disabled={disabled || downloadDisabled}
                  >
                    <DownloadSVG2 fill={theme.colors.neutral[600]} />
                  </ActionButton>
                )}
                <ActionButton
                  type="button"
                  onClick={handleDelete}
                  aria-label="Eliminar documento"
                  disabled={disabled}
                >
                  <TrashSVG
                    width="20"
                    height="20"
                    fill={theme.colors.red[500]}
                  />
                </ActionButton>
              </FooterActions>
            </LoadedFooter>
          )}
        </Box>
      </InputRow>

      <HiddenInput
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
      />

      {(internalError || error) && (
        <ErrorMessage show>{internalError || error}</ErrorMessage>
      )}

      <SkipDocumentModal
        open={isSkipModalOpen}
        title={skipModalTitle}
        severity={skipModalSeverity}
        body={skipModalBody}
        defaultReason={skipReason}
        onConfirm={handleConfirmSkip}
        onCancel={handleCancelSkip}
      />
    </Wrapper>
  );
};

InputFile.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  accept: PropTypes.string,
  formatLabel: PropTypes.string,
  maxSizeMB: PropTypes.number,
  allowSkip: PropTypes.bool,
  skipLabel: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.instanceOf(File),
    PropTypes.string,
    PropTypes.object,
  ]),
  defaultValue: PropTypes.oneOfType([
    PropTypes.instanceOf(File),
    PropTypes.string,
    PropTypes.object,
  ]),
  skipped: PropTypes.bool,
  skipReason: PropTypes.string,
  defaultSkipped: PropTypes.bool,
  defaultSkipReason: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onSkipChange: PropTypes.func,
  onDownload: PropTypes.func,
  showDownload: PropTypes.bool,
  downloadDisabled: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  skipModalTitle: PropTypes.string,
  skipModalSeverity: PropTypes.oneOf([
    "notice",
    "warning",
    "error",
    "success",
    "info",
  ]),
  skipModalBody: PropTypes.node,
  className: PropTypes.string,
};

export default InputFile;
