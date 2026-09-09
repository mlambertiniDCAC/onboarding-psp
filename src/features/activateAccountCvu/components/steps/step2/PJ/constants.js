// Copy local de respaldo para la documentación condicional, por si el back no la
// provee. El back manda value/label en `condicional_apoderado` / `condicional_pep`.
export const CONDITIONAL_DOCUMENTATION = {
  apoderado: { value: "poder_apoderado", label: "Poder del Apoderado" },
  pep: { value: "documentacion_pep", label: "Documentación PEP" },
};

export const YES_NO_OPTIONS = [
  { value: "no", label: "No" },
  { value: "yes", label: "Sí" },
];

export const YES_NO_VALUE = {
  YES: "yes",
  NO: "no",
};

// Documentos obligatorios multi-archivo. El back no señala multiplicidad (todos
// vienen como input_type "file") ni la copy de diseño de estos casos, así que se
// definen acá por `value`. La condicional (apoderado/PEP) se maneja en la pantalla.
export const MULTI_FILE_DOCUMENT_CONFIG = {
  dni_socios: {
    sectionTitle: "DNI de todos los Socios",
    addLabel: "Añadir Socio",
    removeLabel: "Eliminar socio",
    rowLabel: (n) => `DNI del Socio ${n}: Frente y Dorso`,
  },
};

export const isMultiFileDocument = (value) =>
  Object.prototype.hasOwnProperty.call(MULTI_FILE_DOCUMENT_CONFIG, value);

export const getMultiFileConfig = (value) => MULTI_FILE_DOCUMENT_CONFIG[value];

/**
 * Arma el `FormData` para el PUT del draft del paso 2 (multipart/form-data).
 *
 * Contrato del back:
 *   - `step`  → "step_N"
 *   - `flujo` → "ALTA_CVU_PJ"
 *   - `archivos[<value>][]` → archivo adjunto (uno por cada archivo del documento)
 *   - `omitidos` → campo único con un objeto JSON string:
 *       { "<value>": { "motivo": "..." } }
 *
 * @param {Object} params
 * @param {string} params.flujo
 * @param {number} params.step - Paso numérico (CVU_ACTIVATION_STEP).
 * @param {{ value: string, files: File[], skipped: boolean, skipReason: string }[]} params.documents
 * @param {{ value: string, files: File[] }[]} [params.extraDocuments] - Documentación condicional.
 * @returns {FormData}
 */
export const buildDocumentationFormData = ({
  flujo,
  step,
  documents = [],
  extraDocuments = [],
}) => {
  const formData = new FormData();
  formData.append("flujo", flujo);
  formData.append("step", `step_${step}`);

  // Los documentos omitidos se juntan en un único campo `omitidos` (objeto JSON
  // string { <value>: { motivo } }), separado de los archivos adjuntos.
  const omitidos = {};

  // Solo se adjuntan `File` reales recién cargados. Los documentos rehidratados de
  // un draft llegan como descriptores `{ name, url }` que el back ya tiene guardados,
  // así que no se reenvían (un PUT sin la key = documento sin cambios).
  const appendFiles = (value, files = []) =>
    files
      .filter((file) => file instanceof File)
      .forEach((file) => {
        formData.append(`archivos[${value}][]`, file);
      });

  documents.forEach(({ value, files = [], skipped, skipReason }) => {
    if (skipped) {
      omitidos[value] = { motivo: skipReason ?? "" };
      return;
    }
    const attached = files.filter(Boolean);
    if (attached.length > 0) appendFiles(value, attached);
  });

  extraDocuments.forEach(({ value, files }) => appendFiles(value, files));

  if (Object.keys(omitidos).length > 0) {
    formData.append("omitidos", JSON.stringify(omitidos));
  }

  return formData;
};
