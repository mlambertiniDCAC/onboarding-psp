import { useState } from "react";
import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { CheckSVG, OutlineWalletSVG } from "assets/SVGLibrarie";
import { Typography } from "components/Typography";
import { Button } from "components/Button";
import axiosInstance from "src/lib/axiosInstance";
import { CVU_ACTIVATION_STEP, BENEFITS } from "../../lib/constants";

const Card = styled.div`
  border-radius: 12px;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const IconWrapper = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.neutral[0]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;
`;

const HeaderTexts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.neutral[0]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[150]};
  border-radius: 8px;
  padding: 12px;
`;

const BenefitText = styled.span`
  font-size: 0.8125rem;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.neutral[600]};

  em {
    font-style: italic;
    font-weight: 700;
  }
`;

const CheckWrapper = styled.div`
  flex-shrink: 0;
  margin-top: 1px;
`;

const CvuActivationIntro = ({ sujetoId, onStepChange }) => {
  const theme = useTheme();
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState(null);

  const handleActivate = async () => {
    setIsActivating(true);
    setError(null);
    try {
      await axiosInstance.post(`/v1/compliance/${sujetoId}/iniciar`);
      onStepChange(CVU_ACTIVATION_STEP.STEP_0);
    } catch {
      setError("No pudimos activar tu cuenta CVU. Probá de nuevo en unos minutos.");
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Card>
      <HeaderSection>
        <IconWrapper>
          <OutlineWalletSVG
            width="36"
            height="36"
            fill={theme.colors.lightBlue[500]}
          />
        </IconWrapper>
        <HeaderTexts>
          <Typography variant="large" fontWeight="bold" fontStyle="italic">
            Usá deCampoaPagos como tu billetera digital
          </Typography>
          <Typography variant="small" color={theme.colors.neutral[500]}>
            Y accedé a todos estos beneficios:
          </Typography>
        </HeaderTexts>
      </HeaderSection>

      <BenefitsGrid>
        {BENEFITS.map((benefit) => (
          <BenefitItem key={benefit.id}>
            <CheckWrapper>
              <CheckSVG
                width="16"
                height="16"
                fill={theme.colors.lightBlue[500]}
              />
            </CheckWrapper>
            <BenefitText>
              {benefit.pre}
              <em>{benefit.em}</em>
              {benefit.post}
            </BenefitText>
          </BenefitItem>
        ))}
      </BenefitsGrid>

      <Button
        tone="brand"
        role="primary"
        size="large"
        width="100%"
        onClick={handleActivate}
        disabled={isActivating || !sujetoId}
      >
        {isActivating ? "Activando..." : "Activar mi cuenta CVU"}
      </Button>

      {error && (
        <Typography variant="small" color={theme.colors.red[500]}>
          {error}
        </Typography>
      )}
    </Card>
  );
};

CvuActivationIntro.propTypes = {
  sujetoId: PropTypes.string,
  onStepChange: PropTypes.func.isRequired,
};

CvuActivationIntro.defaultProps = {
  sujetoId: undefined,
};

export default CvuActivationIntro;
