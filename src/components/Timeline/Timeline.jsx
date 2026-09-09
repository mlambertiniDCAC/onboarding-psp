import { Fragment } from "react";
import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { CheckSVG, TimelineActiveStepSVG } from "assets/SVGLibrarie";

const STEP_STATE = {
  COMPLETED: "completed",
  ACTIVE: "active",
  UPCOMING: "upcoming",
};

const getStepState = (index, currentIndex) => {
  if (index < currentIndex) return STEP_STATE.COMPLETED;
  if (index === currentIndex) return STEP_STATE.ACTIVE;
  return STEP_STATE.UPCOMING;
};

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
`;

const Circle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: ${({ $state, theme }) =>
    $state === STEP_STATE.COMPLETED ? theme.colors.green[500] : "transparent"};
  border: ${({ $state, theme }) => {
    if ($state === STEP_STATE.COMPLETED) return "none";
    return `2px solid ${theme.colors.neutral[300]}`;
  }};
`;

const Connector = styled.div`
  flex: 1;
  min-width: 12px;
  height: 2px;
  margin-top: 11px;
  background-color: ${({ $completed, theme }) =>
    $completed ? theme.colors.green[500] : theme.colors.neutral[200]};
`;

const Label = styled.span`
  font-size: 0.75rem;
  text-align: center;
  line-height: 1.3;
  font-weight: ${({ $state }) =>
    $state === STEP_STATE.ACTIVE ? "700" : "400"};
  color: ${({ $state, theme }) => {
    if ($state === STEP_STATE.ACTIVE) return theme.colors.lightBlue[500];
    if ($state === STEP_STATE.COMPLETED) return theme.colors.neutral[600];
    return theme.colors.neutral[400];
  }};
`;

const Timeline = ({ steps, currentStepId }) => {
  const theme = useTheme();
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  const renderCircle = (state) => {
    if (state === STEP_STATE.ACTIVE)
      return <TimelineActiveStepSVG fill={theme.colors.lightBlue[500]} />;
    return (
      <Circle $state={state}>
        {state === STEP_STATE.COMPLETED && (
          <CheckSVG width="16" height="16" fill="white" />
        )}
      </Circle>
    );
  };

  return (
    <Container>
      {steps.map((step, index) => {
        const state = getStepState(index, currentIndex);
        return (
          <Fragment key={step.id}>
            <StepItem>
              {renderCircle(state)}
              <Label $state={state}>{step.label}</Label>
            </StepItem>
            {index < steps.length - 1 && (
              <Connector $completed={state === STEP_STATE.COMPLETED} />
            )}
          </Fragment>
        );
      })}
    </Container>
  );
};

Timeline.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  currentStepId: PropTypes.number.isRequired,
};

export default Timeline;
