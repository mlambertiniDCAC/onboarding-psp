import { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Typography } from "src/components/Typography";
import { Button } from "src/components/Button";

const Wrapper = styled.div`
  display: flex;
  min-height: 60vh;
  align-items: center;
  justify-content: center;
`;

const Card = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 320px;
  padding: 32px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};

  input {
    height: 40px;
    padding: 0 12px;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  }
`;

const SujetoIdForm = ({ onSubmit }) => {
  const [value, setValue] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <Wrapper>
      <Card onSubmit={handleSubmit}>
        <Typography variant="h3">Onboarding CVU</Typography>
        <Typography variant="small">
          Ingresá el sujetoId de la sociedad a onboardear.
        </Typography>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="sujetoId"
        />
        <Button tone="brand" role="primary" type="submit">
          Continuar
        </Button>
      </Card>
    </Wrapper>
  );
};

SujetoIdForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default SujetoIdForm;
