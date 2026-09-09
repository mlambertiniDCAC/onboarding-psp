import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { Typography } from "../Typography";

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const OptionCard = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 64px;
  padding: 12px 16px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.neutral[0]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  cursor: pointer;
  text-align: left;
  outline: none;
  transition: border-color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.neutral[300]};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const OptionTexts = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const CheckboxSquare = styled.span`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid
    ${({ theme, $checked }) =>
      $checked ? theme.colors.lightBlue[500] : theme.colors.neutral[200]};
  background: ${({ theme, $checked }) =>
    $checked ? theme.colors.lightBlue[500] : theme.colors.neutral[0]};
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &::after {
    content: "";
    width: 4px;
    height: 10px;
    border: solid ${({ theme }) => theme.colors.neutral[0]};
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    opacity: ${({ $checked }) => ($checked ? 1 : 0)};
    transition: opacity 0.15s ease;
  }
`;

/**
 * InputCheckboxCardGroup — selector vertical de opciones tipo "card" con checkbox.
 * Permite selección múltiple.
 *
 * @param {Object} props
 * @param {Array<{ value: string, label: string, description?: string }>} props.options
 * @param {string[]} [props.value] - valores seleccionados.
 * @param {Function} props.onChange - (name, value[]) => void
 * @param {string} props.name
 * @param {boolean} [props.disabled]
 */
export const InputCheckboxCardGroup = ({
  options,
  value = [],
  onChange,
  name,
  disabled,
}) => {
  const theme = useTheme();

  const handleToggle = (optionValue) => {
    if (disabled || !onChange) return;

    const isSelected = value.includes(optionValue);
    const nextValue = isSelected
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue];

    onChange(name, nextValue);
  };

  return (
    <Group role="group">
      {options.map((option) => {
        const checked = value.includes(option.value);

        return (
          <OptionCard
            key={option.value}
            type="button"
            aria-pressed={checked}
            disabled={disabled}
            onClick={() => handleToggle(option.value)}
          >
            <OptionTexts>
              <Typography
                variant="small"
                fontWeight="bold"
                color={theme.colors.neutral[500]}
              >
                {option.label}
              </Typography>
              {option.description && (
                <Typography variant="tiny" color={theme.colors.neutral[500]}>
                  {option.description}
                </Typography>
              )}
            </OptionTexts>
            <CheckboxSquare $checked={checked} />
          </OptionCard>
        );
      })}
    </Group>
  );
};

InputCheckboxCardGroup.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

export default InputCheckboxCardGroup;
