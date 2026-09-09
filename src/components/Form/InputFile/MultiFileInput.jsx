import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { PlusSVG, TrashSVG } from "assets/SVGLibrarie";
import { Button } from "../../Button";
import { Typography } from "../../Typography";
import { InputFile } from "./InputFile";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
`;

const Slot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const RemoveRow = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

const AddButtonRow = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

/**
 * MultiFileInput — carga de múltiples archivos bajo un mismo `value`.
 *
 * @param {Object} props
 * @param {string} [props.label] - Base del título de fila por defecto (`{label} {n}`).
 * @param {string} [props.title] - Título de sección; activa el layout con header.
 * @param {(n: number) => string} [props.rowLabel] - Título de cada fila (1-based); pisa `label`.
 * @param {(File|null)[]} props.files - Slots controlados (al menos uno).
 * @param {(files: (File|null)[]) => void} props.onFilesChange - Setter de los slots.
 * @param {string} [props.addLabel] - Texto del link de añadir (sin el "+").
 * @param {string} [props.removeLabel] - Texto del botón de eliminar fila (extra).
 * @param {boolean} [props.allowSkip] - Permite omitir el documento (obligatorios).
 * @param {boolean} [props.skipped] - Estado de omisión (controlado).
 * @param {string} [props.skipReason] - Motivo de omisión (controlado; para rehidratar draft).
 * @param {(skipped: boolean, reason: string) => void} [props.onSkipChange] - Callback de omisión.
 * @param {boolean} [props.showDownload] - Muestra el botón de descarga (default false).
 */
export const MultiFileInput = ({
  label,
  title,
  rowLabel,
  files,
  onFilesChange,
  addLabel = "Añadir otro archivo",
  removeLabel = "Eliminar",
  allowSkip = false,
  skipped = false,
  skipReason,
  onSkipChange,
  showDownload = false,
}) => {
  const theme = useTheme();
  const slots = files?.length ? files : [null];
  const isSkipped = allowSkip && skipped;
  const visibleSlots = isSkipped ? slots.slice(0, 1) : slots;

  const getRowTitle = (index) =>
    rowLabel ? rowLabel(index + 1) : `${label} ${index + 1}`;

  // El tacho del InputFile limpia el archivo del slot; el botón Eliminar quita la fila.
  const handleSlotSubmit = (index) => (file) =>
    onFilesChange(slots.map((slot, i) => (i === index ? file : slot)));

  const handleRemove = (index) => () =>
    onFilesChange(slots.filter((_, i) => i !== index));

  const handleAdd = () => onFilesChange([...slots, null]);

  const addButton = (
    <Button
      role="tiny"
      tone="brand"
      icon={<PlusSVG width="16" height="16" fill="currentColor" />}
      onClick={handleAdd}
    >
      {addLabel}
    </Button>
  );

  return (
    <Wrapper>
      {title && (
        <Header>
          <Typography
            variant="small"
            fontWeight="bold"
            color={theme.colors.neutral[700]}
          >
            {title}
          </Typography>
          {!isSkipped && addButton}
        </Header>
      )}
      {visibleSlots.map((file, index) => (
        <Slot key={index}>
          <InputFile
            title={getRowTitle(index)}
            value={file}
            showDownload={showDownload}
            allowSkip={allowSkip && index === 0}
            skipped={allowSkip && index === 0 ? skipped : undefined}
            skipReason={allowSkip && index === 0 ? skipReason : undefined}
            onSubmit={handleSlotSubmit(index)}
            onSkipChange={onSkipChange}
          />
          {index > 0 && (
            <RemoveRow>
              <Button
                role="tiny"
                tone="destructive"
                icon={<TrashSVG width="16" height="16" fill="currentColor" />}
                onClick={handleRemove(index)}
              >
                {removeLabel}
              </Button>
            </RemoveRow>
          )}
        </Slot>
      ))}
      {!title && !isSkipped && <AddButtonRow>{addButton}</AddButtonRow>}
    </Wrapper>
  );
};

MultiFileInput.propTypes = {
  label: PropTypes.string,
  title: PropTypes.string,
  rowLabel: PropTypes.func,
  files: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.instanceOf(File),
      // Descriptor de un archivo ya subido (rehidratado desde un draft).
      PropTypes.shape({ name: PropTypes.string, url: PropTypes.string }),
      PropTypes.oneOf([null]),
    ])
  ).isRequired,
  onFilesChange: PropTypes.func.isRequired,
  addLabel: PropTypes.string,
  removeLabel: PropTypes.string,
  allowSkip: PropTypes.bool,
  skipped: PropTypes.bool,
  skipReason: PropTypes.string,
  onSkipChange: PropTypes.func,
  showDownload: PropTypes.bool,
};

export default MultiFileInput;
