import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "../../assets/themes";
import WizardStepCard, {
  WIZARD_STEP_CARD_MAX_WIDTH,
} from "../WizardStepCard/WizardStepCard";
import { Button } from "../Button";
import { Typography } from "../Typography";

describe("shared components", () => {
  it("exposes the wizard card max width constant", () => {
    expect(typeof WIZARD_STEP_CARD_MAX_WIDTH).toBe("number");
  });

  it("renders a WizardStepCard with its sub-components", () => {
    const { container } = render(
      <ThemeProvider theme={lightTheme}>
        <WizardStepCard onSubmit={() => {}}>
          <WizardStepCard.Header title="t" subtitle="s" />
          <WizardStepCard.Body>
            <Typography variant="regular">hola</Typography>
            <Button tone="brand" role="primary">
              ok
            </Button>
          </WizardStepCard.Body>
          <WizardStepCard.Footer onPrevious={() => {}} />
        </WizardStepCard>
      </ThemeProvider>
    );
    expect(container.querySelector("form")).toBeTruthy();
  });
});
