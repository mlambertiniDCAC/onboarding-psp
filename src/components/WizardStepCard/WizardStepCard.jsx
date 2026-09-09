import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { Typography } from "components/Typography";
import { Button } from "components/Button";

export const WIZARD_STEP_CARD_MAX_WIDTH = 685;

const Card = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  background: ${({ theme }) => theme.colors.neutral[0]};
  border-radius: 12px;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[150]};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap}px;
  padding: 24px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.neutral[150]};
`;

const WizardStepCardHeader = ({ title, subtitle }) => {
  const theme = useTheme();

  return (
    <Header>
      <Typography
        variant="h5"
        fontWeight="bold"
        color={theme.colors.neutral[700]}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="regular" color={theme.colors.neutral[500]}>
          {subtitle}
        </Typography>
      )}
    </Header>
  );
};

WizardStepCardHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

const WizardStepCardBody = ({ children, gap = 16 }) => {
  return <Body $gap={gap}>{children}</Body>;
};

WizardStepCardBody.propTypes = {
  children: PropTypes.node.isRequired,
  gap: PropTypes.number,
};

const WizardStepCardFooter = ({
  onPrevious,
  previousLabel = "Anterior",
  nextLabel = "Siguiente",
  isNextDisabled = false,
  isNextLoading = false,
  children,
}) => {
  if (children) {
    return <Footer>{children}</Footer>;
  }

  return (
    <Footer>
      <Button
        tone="brand"
        role="tertiary"
        type="button"
        onClick={onPrevious}
        disabled={isNextLoading}
      >
        {previousLabel}
      </Button>
      <Button
        tone="brand"
        role="primary"
        type="submit"
        disabled={isNextDisabled}
        loading={isNextLoading}
      >
        {nextLabel}
      </Button>
    </Footer>
  );
};

WizardStepCardFooter.propTypes = {
  onPrevious: PropTypes.func,
  previousLabel: PropTypes.string,
  nextLabel: PropTypes.string,
  isNextDisabled: PropTypes.bool,
  isNextLoading: PropTypes.bool,
  children: PropTypes.node,
};

const WizardStepCard = ({ children, onSubmit }) => {
  return <Card onSubmit={onSubmit}>{children}</Card>;
};

WizardStepCard.propTypes = {
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

WizardStepCard.Header = WizardStepCardHeader;
WizardStepCard.Body = WizardStepCardBody;
WizardStepCard.Footer = WizardStepCardFooter;

export default WizardStepCard;
