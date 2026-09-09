import { PERSON_TYPE } from "../../../lib/constants";

// Contenido de los Términos y Condiciones por tipo de persona.
// TODO: reemplazar el texto placeholder por la copia legal definitiva. El texto
// difiere entre Persona Física y Persona Jurídica, por eso se mantienen separados.

const PF_TERMS_SECTIONS = [
  {
    id: "introduccion",
    title: "1. Introducción",
    body: "Loremn ipsum dolor sit amet consectetur. Ultrices lectus ipsum non ultrices aliquet nunc. Magna tincidunt fringilla ante erat facilisi a. Ut sed suspendisse tristique lacus nunc libero dui blandit viverra. Arcu sagittis sit vitae tellus non erat molestie aliquam. Duis gravida aliquam pellentesque sodales tempus. Fringilla in eget ultrices odio elit. At at lacus facilisis pellentesque scelerisque ipsum ultrices sollicitudin. Massa tincidunt nisi duis eu id volutpat amet ridiculus. Tortor mauris faucibus velit diam mattis. Lectus vehicula gravida justo est interdum a dolor cras. Pellentesque risus nisl urna volutpat. Sapien vestibulum viverra pellentesque sollicitudin metus in.",
  },
  {
    id: "producto",
    title: "2. Producto",
    body: "Fermentum aenean congue etiam nisi. At sodales interdum tincidunt integer integer posuere lacinia malesuada. Nisi consectetur mauris morbi mattis ultricies ultrices sed diam. Dui porta scelerisque amet a porttitor enim dui. Lectus laoreet nibh ipsum eu facilisi. Lorem laoreet ipsum nibh etiam sed lobortis amet. Orci tellus a at facilisis. Orci suspendisse elementum tincidunt dictum dui quam vitae. Diam dolor libero eget porttitor. Sapien condimentum dis nibh in tempor. In mi faucibus amet ultrices. A consequat felis vestibulum tempus metus ornare quisque. Interdum id interdum tincidunt aliquet ut ut ultricies pharetra. Eu etiam parturient id purus at enim ipsum.",
  },
  {
    id: "responsabilidades",
    title: "3. Responsabilidades del titular",
    body: "Amet mauris eget amet dolor aliquet neque varius. In aliquam est adipiscing a. Tellus leo tincidunt non feugiat nibh integer augue sit mauris. Sed eu dui dignissim ac. Lectus a pellentesque sed risus nec risus adipiscing. Erat sit amet consectetur fringilla ante erat facilisi a ut sed suspendisse tristique lacus nunc libero dui blandit viverra arcu sagittis sit vitae tellus non erat molestie aliquam duis gravida.",
  },
  {
    id: "privacidad",
    title: "4. Política de Privacidad",
    body: "Pellentesque risus nisl urna volutpat sapien vestibulum viverra pellentesque sollicitudin metus in. Fermentum aenean congue etiam nisi at sodales interdum tincidunt integer integer posuere lacinia malesuada nisi consectetur mauris morbi mattis ultricies ultrices sed diam dui porta scelerisque amet a porttitor enim dui lectus laoreet nibh ipsum eu facilisi lorem laoreet ipsum nibh etiam sed lobortis amet.",
  },
];

const PJ_TERMS_SECTIONS = [
  {
    id: "introduccion",
    title: "1. Introducción",
    body: "Lorem ipsum dolor sit amet consectetur. Ultrices lectus ipsum non ultrices aliquet nunc. Magna tincidunt fringilla ante erat facilisi a. Ut sed suspendisse tristique lacus nunc libero dui blandit viverra. Arcu sagittis sit vitae tellus non erat molestie aliquam. Duis gravida aliquam pellentesque sodales tempus. Fringilla in eget ultrices odio elit. At at lacus facilisis pellentesque scelerisque ipsum ultrices sollicitudin. Massa tincidunt nisi duis eu id volutpat amet ridiculus. Tortor mauris faucibus velit diam mattis. Lectus vehicula gravida justo est interdum a dolor cras. Pellentesque risus nisl urna volutpat. Sapien vestibulum viverra pellentesque sollicitudin metus in.",
  },
  {
    id: "producto",
    title: "2. Producto",
    body: "Fermentum aenean congue etiam nisi. At sodales interdum tincidunt integer integer posuere lacinia malesuada. Nisi consectetur mauris morbi mattis ultricies ultrices sed diam. Dui porta scelerisque amet a porttitor enim dui. Lectus laoreet nibh ipsum eu facilisi. Lorem laoreet ipsum nibh etiam sed lobortis amet. Orci tellus a at facilisis. Orci suspendisse elementum tincidunt dictum dui quam vitae. Diam dolor libero eget porttitor. Sapien condimentum dis nibh in tempor. In mi faucibus amet ultrices. A consequat felis vestibulum tempus metus ornare quisque. Interdum id interdum tincidunt aliquet ut ut ultricies pharetra. Eu etiam parturient id purus at enim ipsum.",
  },
  {
    id: "responsabilidades",
    title: "3. Responsabilidades del titular",
    body: "Amet mauris eget amet dolor aliquet neque varius. In aliquam est adipiscing a. Tellus leo tincidunt non feugiat nibh integer augue sit mauris. Sed eu dui dignissim ac. Lectus a pellentesque sed risus nec risus adipiscing. Erat sit amet consectetur fringilla ante erat facilisi a ut sed suspendisse tristique lacus nunc libero dui blandit viverra arcu sagittis sit vitae tellus non erat molestie aliquam duis gravida.",
  },
  {
    id: "privacidad",
    title: "4. Política de Privacidad",
    body: "Pellentesque risus nisl urna volutpat sapien vestibulum viverra pellentesque sollicitudin metus in. Fermentum aenean congue etiam nisi at sodales interdum tincidunt integer integer posuere lacinia malesuada nisi consectetur mauris morbi mattis ultricies ultrices sed diam dui porta scelerisque amet a porttitor enim dui lectus laoreet nibh ipsum eu facilisi lorem laoreet ipsum nibh etiam sed lobortis amet.",
  },
];

export const TERMS_SECTIONS_BY_PERSON = {
  [PERSON_TYPE.PERSONA_FISICA]: PF_TERMS_SECTIONS,
  [PERSON_TYPE.PERSONA_JURIDICA]: PJ_TERMS_SECTIONS,
};
