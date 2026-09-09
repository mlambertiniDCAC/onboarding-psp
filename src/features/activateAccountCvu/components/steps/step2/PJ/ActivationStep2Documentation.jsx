import { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import styled, { useTheme } from "styled-components";
import { Formik } from "formik";
import { InfoSVG3 } from "src/assets/SVGLibrarie";
import { InputFile } from "components/Form/InputFile/InputFile";
import { MultiFileInput } from "components/Form/InputFile/MultiFileInput";
import { InputOptions } from "components/Form/InputOptions";
import { FormSection } from "components/Form/FormSection";
import { Typography } from "components/Typography";
import InfoAlert from "components/common/InfoAlert";
import InfoMessage from "components/common/InfoMessage";
import Skeleton from "components/common/Skeleton";
import WizardStepCard from "components/WizardStepCard/WizardStepCard";
import { selectDefaultSocietyId } from "src/slices/profile/profileSelectors";
import { CVU_ACTIVATION_STEP, CVU_FLOW_TYPE } from "../../../../lib/constants";
import { setStepData } from "../../../../store/cvuActivation/cvuActivationSlice";
import {
  fetchDocumentationStep,
  saveDraftStep,
} from "../../../../store/cvuActivation/cvuActivationActions";
import {
  selectStepData,
  selectDocumentationOptions,
  selectIsFetchingDocumentation,
  selectDocumentationError,
  selectIsSubmitting,
  selectSubmitError,
} from "../../../../store/cvuActivation/cvuActivationSelectors";
import { SOCIETY_TYPE } from "../../step1/PJ/constants";
import {
  CONDITIONAL_DOCUMENTATION,
  YES_NO_OPTIONS,
  YES_NO_VALUE,
  buildDocumentationFormData,
  isMultiFileDocument,
  getMultiFileConfig,
} from "./constants";

const DOCUMENTS_SKELETON_COUNT = 4;

const APODERADO_FIELD = "hasApoderado";
const PEP_FIELD = "hasPep";

const DocumentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const HelpTextRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
`;

const QuestionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  width: 100%;
`;

const QuestionText = styled.div`
  flex: 1 0 0;
  min-width: 0;
`;

const SelectorWrapper = styled.div`
  display: flex;
  width: 100px;
  flex-shrink: 0;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.colors.neutral[150]};
`;

export const ActivationStep2Documentation = ({ onStepChange }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const societyId = useSelector(selectDefaultSocietyId);
  const stepData = useSelector(selectStepData);
  const documentationOptions = useSelector(selectDocumentationOptions);
  const isFetching = useSelector(selectIsFetchingDocumentation);
  const fetchError = useSelector(selectDocumentationError);
  const isSubmitting = useSelector(selectIsSubmitting);
  const submitError = useSelector(selectSubmitError);

  const societyType = stepData?.step1?.societyType ?? SOCIETY_TYPE.SA;
  const savedStep2 = stepData?.step2;

  const documents = documentationOptions.documents ?? [];

  const apoderadoDoc =
    documentationOptions.apoderado ?? CONDITIONAL_DOCUMENTATION.apoderado;
  const pepDoc = documentationOptions.pep ?? CONDITIONAL_DOCUMENTATION.pep;

  useEffect(() => {
    dispatch(fetchDocumentationStep(societyType));
  }, [dispatch, societyType]);

  // Rehidrata lo persistido al confirmar el paso con "Siguiente" y lo que ya venía
  // guardado en el draft del back. Los archivos ya subidos llegan como descriptores
  // `{ name, url }` (no `File`): el InputFile los muestra como "Adjunto" y el submit
  // no los reenvía (ver buildDocumentationFormData). Si el usuario volvió con
  // "Anterior" no hay datos guardados y el form arranca limpio.
  const initialValues = useMemo(() => {
    const savedDocuments = savedStep2?.documents ?? {};
    const apoderadoSaved = savedDocuments[apoderadoDoc.value];
    const pepSaved = savedDocuments[pepDoc.value];
    return {
      documents: documents.reduce((acc, doc) => {
        const saved = savedDocuments[doc.value];
        const savedFiles = saved?.files ?? [];
        const skipped = Boolean(saved?.skipped);
        const skipReason = saved?.skipReason ?? "";
        acc[doc.value] = isMultiFileDocument(doc.value)
          ? {
              files: savedFiles.length ? savedFiles : [null],
              skipped,
              skipReason,
            }
          : { file: savedFiles[0] ?? null, skipped, skipReason };
        return acc;
      }, {}),
      hasApoderado:
        Boolean(apoderadoSaved?.files?.length) ||
        Boolean(savedStep2?.hasApoderado),
      apoderadoFiles: apoderadoSaved?.files?.length
        ? apoderadoSaved.files
        : [null],
      hasPep: Boolean(pepSaved?.files?.length) || Boolean(savedStep2?.hasPep),
      pepFiles: pepSaved?.files?.length ? pepSaved.files : [null],
    };
  }, [documents, savedStep2, apoderadoDoc.value, pepDoc.value]);

  const toYesNo = (value) => (value ? YES_NO_VALUE.YES : YES_NO_VALUE.NO);

  const hasAnyFile = (files) => (files ?? []).some(Boolean);

  const isDocumentSatisfied = (entry) => {
    if (!entry) return false;
    if (entry.skipped) return true;
    if (Array.isArray(entry.files)) return hasAnyFile(entry.files);
    return Boolean(entry.file);
  };

  // Fuente única de validación: la usan tanto Formik (para mostrar errores de
  // campo) como el cálculo síncrono del `disabled` del botón. Derivar la validez
  // directamente de `values` + `documents` evita depender del `isValid` cacheado
  // de Formik, que queda desincronizado por la carga async de `documents` + el
  // reinit (`enableReinitialize`) y por eso no reconocía el "No" de los toggles.
  const getDocumentationErrors = (values) => {
    const errors = {};
    const documentsSatisfied =
      documents.length > 0 &&
      documents.every((doc) =>
        isDocumentSatisfied(values.documents?.[doc.value])
      );
    if (!documentsSatisfied) {
      errors.documents = "Adjuntá u omití todos los documentos requeridos.";
    }
    if (values.hasApoderado && !hasAnyFile(values.apoderadoFiles)) {
      errors.apoderadoFile = "Adjuntá el poder del apoderado.";
    }
    if (values.hasPep && !hasAnyFile(values.pepFiles)) {
      errors.pepFile = "Adjuntá la documentación PEP.";
    }
    return errors;
  };

  const validate = (values) => getDocumentationErrors(values);

  // Se preserva el valor crudo de cada slot bajo `files`, el mismo shape que
  // produce el adapter del draft: los `File` recién cargados (que el submit
  // reenvía) conviven con los descriptores `{ name, url }` ya subidos. El slice de
  // cvuActivation no está en redux-persist, así que los `File` sobreviven al
  // desmontaje del paso en el round-trip Siguiente→Anterior sin serializarse, y así
  // se rehidratan tal cual — incluyendo ediciones, altas y bajas en campos
  // multi-archivo.
  const rawFiles = (files) => (files ?? []).filter(Boolean);

  const entryRawFiles = (entry) =>
    Array.isArray(entry?.files)
      ? rawFiles(entry.files)
      : entry?.file
        ? [entry.file]
        : [];

  const persistStepData = (values) => {
    const documentsData = documents.reduce((acc, doc) => {
      const entry = values.documents[doc.value] ?? {};
      acc[doc.value] = {
        files: entryRawFiles(entry),
        skipped: Boolean(entry.skipped),
        skipReason: entry.skipReason ?? "",
      };
      return acc;
    }, {});
    if (values.hasApoderado) {
      documentsData[apoderadoDoc.value] = {
        files: rawFiles(values.apoderadoFiles),
        skipped: false,
        skipReason: "",
      };
    }
    if (values.hasPep) {
      documentsData[pepDoc.value] = {
        files: rawFiles(values.pepFiles),
        skipped: false,
        skipReason: "",
      };
    }
    dispatch(
      setStepData({
        step: CVU_ACTIVATION_STEP.STEP_2,
        data: {
          hasApoderado: values.hasApoderado,
          hasPep: values.hasPep,
          documents: documentsData,
        },
      })
    );
  };

  const entryFiles = (entry) =>
    Array.isArray(entry?.files)
      ? entry.files.filter(Boolean)
      : entry?.file
        ? [entry.file]
        : [];

  const handleFormSubmit = async (values, { setSubmitting }) => {
    const documentsPayload = documents.map((doc) => {
      const entry = values.documents[doc.value] ?? {};
      return {
        value: doc.value,
        files: entryFiles(entry),
        skipped: Boolean(entry.skipped),
        skipReason: entry.skipReason ?? "",
      };
    });

    const extraDocuments = [];
    const apoderadoFiles = (values.apoderadoFiles ?? []).filter(Boolean);
    if (values.hasApoderado && apoderadoFiles.length > 0) {
      extraDocuments.push({ value: apoderadoDoc.value, files: apoderadoFiles });
    }
    const pepFiles = (values.pepFiles ?? []).filter(Boolean);
    if (values.hasPep && pepFiles.length > 0) {
      extraDocuments.push({ value: pepDoc.value, files: pepFiles });
    }

    const formData = buildDocumentationFormData({
      flujo: CVU_FLOW_TYPE.PJ,
      step: CVU_ACTIVATION_STEP.STEP_2,
      documents: documentsPayload,
      extraDocuments,
    });

    try {
      await dispatch(saveDraftStep({ societyId, formData })).unwrap();
      persistStepData(values);
      onStepChange(CVU_ACTIVATION_STEP.STEP_3);
    } catch {
      // El error se refleja vía submitError en el store.
    } finally {
      setSubmitting(false);
    }
  };

  const handleApoderadoChange = (setValues) => (_name, value) => {
    const next = value === YES_NO_VALUE.YES;
    setValues(
      (prev) => ({
        ...prev,
        [APODERADO_FIELD]: next,
        apoderadoFiles: next ? prev.apoderadoFiles : [null],
      }),
      true
    );
  };

  const handlePepChange = (setValues) => (_name, value) => {
    const next = value === YES_NO_VALUE.YES;
    setValues(
      (prev) => ({
        ...prev,
        [PEP_FIELD]: next,
        pepFiles: next ? prev.pepFiles : [null],
      }),
      true
    );
  };

  // Al omitir se limpian los archivos del documento (así no se envían igual);
  // skipped + skipReason van en el mismo setValues para validar el estado completo.
  const buildDocumentSkipHandler = (setValues, docValue) => (skipped, reason) =>
    setValues((prev) => {
      const entry = prev.documents[docValue] ?? {};
      const clearedFiles = Array.isArray(entry.files)
        ? { files: skipped ? [null] : entry.files }
        : { file: skipped ? null : entry.file };
      return {
        ...prev,
        documents: {
          ...prev.documents,
          [docValue]: {
            ...entry,
            ...clearedFiles,
            skipped,
            skipReason: reason,
          },
        },
      };
    }, true);

  const renderDocumentField = (doc, values, setFieldValue, setValues) => {
    const entry = values.documents?.[doc.value] ?? {};
    if (isMultiFileDocument(doc.value)) {
      const config = getMultiFileConfig(doc.value);
      return (
        <MultiFileInput
          key={doc.value}
          title={config.sectionTitle}
          rowLabel={config.rowLabel}
          addLabel={config.addLabel}
          removeLabel={config.removeLabel}
          files={entry.files ?? [null]}
          onFilesChange={(files) =>
            setFieldValue(`documents.${doc.value}.files`, files, true)
          }
          showDownload
          allowSkip
          skipped={Boolean(entry.skipped)}
          skipReason={entry.skipReason ?? ""}
          onSkipChange={buildDocumentSkipHandler(setValues, doc.value)}
        />
      );
    }
    return (
      <InputFile
        key={doc.value}
        title={`${doc.label} *`}
        allowSkip
        value={entry.file ?? null}
        skipped={Boolean(entry.skipped)}
        skipReason={entry.skipReason ?? ""}
        showDownload={Boolean(entry.file?.url)}
        onSubmit={(file) =>
          setFieldValue(`documents.${doc.value}.file`, file, true)
        }
        onSkipChange={buildDocumentSkipHandler(setValues, doc.value)}
      />
    );
  };

  const renderDocuments = (values, setFieldValue, setValues) => {
    if (isFetching) {
      return (
        <DocumentsList>
          {Array.from({ length: DOCUMENTS_SKELETON_COUNT }).map((_, index) => (
            <Skeleton key={index} height="80px" />
          ))}
        </DocumentsList>
      );
    }

    if (fetchError || documents.length === 0) {
      return (
        <InfoMessage
          variant="danger"
          message="No pudimos cargar la documentación requerida. Intentá nuevamente más tarde."
        />
      );
    }

    return (
      <DocumentsList>
        {documents.map((doc) =>
          renderDocumentField(doc, values, setFieldValue, setValues)
        )}
        <HelpTextRow>
          <InfoSVG3 width="20" height="20" fill={theme.colors.lightBlue[500]} />
          <Typography variant="small" color={theme.colors.neutral[700]}>
            En caso de omitir un documento solicitado, deberá ingresar un motivo
            correspondiente para poder continuar con el proceso.
          </Typography>
        </HelpTextRow>
      </DocumentsList>
    );
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validate={validate}
      validateOnMount
      onSubmit={handleFormSubmit}
    >
      {({ values, setFieldValue, setValues, handleSubmit }) => {
        const hasErrors =
          Object.keys(getDocumentationErrors(values)).length > 0;
        const isNextDisabled =
          hasErrors || isFetching || isSubmitting || Boolean(fetchError);

        return (
          <WizardStepCard onSubmit={handleSubmit}>
            <WizardStepCard.Header
              title="Documentación"
              subtitle="A continuación te solicitamos que nos adjuntes la siguiente documentación"
            />

            <WizardStepCard.Body gap={32}>
              {renderDocuments(values, setFieldValue, setValues)}

              <FormSection title="Documentación Adicional" gap={24}>
                <QuestionRow>
                  <QuestionText>
                    <Typography
                      variant="tiny"
                      color={theme.colors.neutral[700]}
                    >
                      ¿Tiene apoderado?
                    </Typography>
                  </QuestionText>
                  <SelectorWrapper>
                    <InputOptions
                      name={APODERADO_FIELD}
                      tone="filter"
                      options={YES_NO_OPTIONS}
                      value={toYesNo(values.hasApoderado)}
                      onChange={handleApoderadoChange(setValues)}
                    />
                  </SelectorWrapper>
                </QuestionRow>
                {values.hasApoderado && (
                  <MultiFileInput
                    label={apoderadoDoc.label}
                    addLabel="Añadir otro apoderado"
                    files={values.apoderadoFiles}
                    onFilesChange={(files) =>
                      setFieldValue("apoderadoFiles", files, true)
                    }
                  />
                )}

                <Divider />

                <QuestionRow>
                  <QuestionText>
                    <Typography
                      variant="tiny"
                      color={theme.colors.neutral[700]}
                    >
                      ¿Algún socio o representante legal es Persona Expuesta
                      Políticamente (PEP)?
                    </Typography>
                  </QuestionText>
                  <SelectorWrapper>
                    <InputOptions
                      name={PEP_FIELD}
                      tone="filter"
                      options={YES_NO_OPTIONS}
                      value={toYesNo(values.hasPep)}
                      onChange={handlePepChange(setValues)}
                    />
                  </SelectorWrapper>
                </QuestionRow>
                {values.hasPep && (
                  <MultiFileInput
                    label={pepDoc.label}
                    addLabel="Añadir otro documento"
                    files={values.pepFiles}
                    onFilesChange={(files) =>
                      setFieldValue("pepFiles", files, true)
                    }
                  />
                )}
              </FormSection>

              <InfoAlert
                title="Solo se puede crear una cuenta virtual por sociedad."
                description="En caso de querer crear otra cuenta, se debe cambiar de sociedad en el Inicio."
              />

              {submitError && (
                <InfoMessage
                  variant="danger"
                  message="No pudimos guardar la documentación. Intentá nuevamente más tarde."
                />
              )}
            </WizardStepCard.Body>

            <WizardStepCard.Footer
              onPrevious={() => onStepChange(CVU_ACTIVATION_STEP.STEP_1)}
              isNextDisabled={isNextDisabled}
              isNextLoading={isSubmitting}
            />
          </WizardStepCard>
        );
      }}
    </Formik>
  );
};

ActivationStep2Documentation.propTypes = {
  onStepChange: PropTypes.func.isRequired,
};

export default ActivationStep2Documentation;
