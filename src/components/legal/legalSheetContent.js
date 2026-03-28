/** @typedef {'terms' | 'privacy' | 'about'} LegalSheetType */

import { APP_VERSION } from '../../lib/appVersion.js'

/**
 * @param {LegalSheetType} type
 * @returns {{ title: string, blocks: { heading: string, paragraphs: string[] }[] }}
 */
export function getLegalSheetBody(type) {
  if (type === 'terms') {
    return {
      title: 'Términos y condiciones',
      blocks: [
        {
          heading: 'Aceptación',
          paragraphs: [
            'Al usar QUEHAYHOY (“la aplicación”), aceptas estos términos. Si no estás de acuerdo, te pedimos no utilizar el servicio.',
            'La aplicación tiene fines informativos: mostramos eventos y planes en Guayaquil y alrededores según la información disponible en el momento.',
          ],
        },
        {
          heading: 'Uso del servicio',
          paragraphs: [
            'Te comprometes a usar la app de forma lícita y a no intentar interferir con su funcionamiento ni con la experiencia de otras personas.',
            'Los organizadores y locales son responsables de la exactitud de fechas, precios y reglas de sus eventos. Verifica siempre con la fuente oficial antes de asistir.',
          ],
        },
        {
          heading: 'Cuenta y contenido',
          paragraphs: [
            'Si inicias sesión con Google, aplican también las políticas de autenticación de Google y las nuestras de privacidad.',
            'Nos reservamos el derecho de actualizar estos términos; publicaremos cambios relevantes en la app cuando sea razonable.',
          ],
        },
        {
          heading: 'Limitación de responsabilidad',
          paragraphs: [
            'QUEHAYHOY se ofrece “tal cual”. No garantizamos que la información esté libre de errores o que el servicio sea ininterrumpido.',
            'En la medida permitida por la ley, no seremos responsables por daños indirectos derivados del uso de la información mostrada en la app.',
          ],
        },
      ],
    }
  }

  if (type === 'privacy') {
    return {
      title: 'Política de privacidad',
      blocks: [
        {
          heading: 'Qué datos tratamos',
          paragraphs: [
            'Si usas inicio de sesión con Google, podemos recibir datos básicos de tu cuenta (por ejemplo nombre, correo e identificador) según lo que permita Firebase Authentication.',
            'Podemos registrar datos técnicos habituales (tipo de dispositivo, versión de la app, registros de errores anonimizados) para mejorar estabilidad y rendimiento.',
          ],
        },
        {
          heading: 'Finalidad',
          paragraphs: [
            'Utilizamos la información para autenticarte, personalizar partes de la experiencia (por ejemplo favoritos o preferencias guardadas) y mantener la seguridad del servicio.',
            'No vendemos tus datos personales a terceros.',
          ],
        },
        {
          heading: 'Firebase y proveedores',
          paragraphs: [
            'Parte del servicio puede estar alojada en Google Firebase / infraestructura en la nube. El tratamiento de datos por parte de Google se rige por sus políticas aplicables.',
          ],
        },
        {
          heading: 'Tus derechos',
          paragraphs: [
            'Puedes solicitar acceso, rectificación o eliminación de datos personales cuando la ley lo permita, contactando al responsable del proyecto.',
            'Puedes dejar de usar la app y, si aplica, revocar el acceso de QUEHAYHOY desde la configuración de tu cuenta de Google.',
          ],
        },
        {
          heading: 'Cambios',
          paragraphs: [
            'Podemos actualizar esta política. Te recomendamos revisar esta sección ocasionalmente. El uso continuado de la app tras cambios relevantes implica que tomaste conocimiento de ellos.',
          ],
        },
      ],
    }
  }

  return {
    title: 'Acerca de la app',
    blocks: [
      {
        heading: 'QUEHAYHOY',
        paragraphs: [
          'QUEHAYHOY te ayuda a descubrir qué hacer hoy en Guayaquil: eventos, planes y colecciones especiales en un solo lugar.',
          'Nuestro objetivo es que encuentres planes alineados a tus gustos, sector y disponibilidad, con una experiencia pensada para móvil.',
        ],
      },
      {
        heading: 'Versión',
        paragraphs: [
          `Versión de la aplicación: ${APP_VERSION}`,
          'El contenido de eventos es proporcionado por quienes publican en la plataforma; los horarios y condiciones pueden cambiar sin previo aviso.',
        ],
      },
      {
        heading: 'Contacto y mejoras',
        paragraphs: [
          'Si tienes sugerencias, reportes de errores o quieres colaborar, puedes escribirnos por los canales que el proyecto habilite (redes o correo).',
          'Gracias por usar QUEHAYHOY.',
        ],
      },
    ],
  }
}
