import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "src/lib/axiosInstance";
import { Typography } from "src/components/Typography";
import { STEP_QUERY_PARAM } from "src/features/activateAccountCvu/lib/constants";

const COMPLIANCE_ESTADO = {
  SIN_SOLICITUD: "sin_solicitud",
  EN_PROGRESO: "en_progreso",
  EN_REVISION: "en_revision",
};

const Wrapper = styled.div`
  display: flex;
  min-height: 60vh;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
`;

const ComplianceStatusGate = ({ sujetoId, children }) => {
  const [searchParams] = useSearchParams();
  const step = searchParams.get(STEP_QUERY_PARAM);
  const [estado, setEstado] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    axiosInstance
      .get(`/v1/compliance/${sujetoId}/estado`)
      .then((response) => {
        if (!cancelled) setEstado(response.data?.estado ?? null);
      })
      .catch(() => {
        if (!cancelled)
          setError("No pudimos consultar el estado del compliance.");
      })
      .finally(() => {
        if (!cancelled) setHasLoadedOnce(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sujetoId, step]);

  if (!hasLoadedOnce) {
    return (
      <Wrapper>
        <Typography variant="regular">
          Consultando estado del compliance...
        </Typography>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <Typography variant="regular" color="#c0392b">
          {error}
        </Typography>
      </Wrapper>
    );
  }

  if (estado === COMPLIANCE_ESTADO.EN_REVISION) {
    return (
      <Wrapper>
        <Typography variant="h4" fontWeight="bold">
          Tiene un compliance en revisión
        </Typography>
      </Wrapper>
    );
  }

  return children;
};

ComplianceStatusGate.propTypes = {
  sujetoId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default ComplianceStatusGate;
