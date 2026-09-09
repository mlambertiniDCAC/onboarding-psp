export const SOCIETY_TYPE = {
  SA: "SA",
  SRL: "SRL",
  SH: "SH",
  SUCESION: "SUCESION",
};

// Detalle visual (label) por tipo societario.
// El back provee value/label; mantenemos la copy local para respetar el diseño
// (labels con la sigla entre paréntesis). El back define value, orden y
// disponibilidad; si trae un value desconocido, queda el label del back.
export const SOCIETY_TYPE_DETAILS = {
  [SOCIETY_TYPE.SA]: { label: "Sociedad Anónima (SA)" },
  [SOCIETY_TYPE.SRL]: { label: "Sociedad de Responsabilidad Limitada (SRL)" },
  [SOCIETY_TYPE.SH]: { label: "Sociedad de Hecho (SH)" },
  [SOCIETY_TYPE.SUCESION]: { label: "Sucesión" },
};

// Mergea cada opción de la respuesta con su detalle local según la key (value).
export const mergeSocietyTypeOptions = (options = []) =>
  options.map((option) => ({
    ...option,
    ...SOCIETY_TYPE_DETAILS[option.value],
  }));
