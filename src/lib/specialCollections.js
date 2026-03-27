export const SPECIAL_COLLECTIONS = [
  {
    id: 'viernes-santo',
    title: 'Viernes Santo',
    dateLabel: '3 Abr',
    badge: 'FERIADO',
    description: 'Planes tranquilos y culturales para vivir Semana Santa en GYE.',
    day: 3,
    month: 4,
    keywords: ['semana santa', 'religioso', 'cultural', 'iglesia'],
    imageUrl:
      'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'dia-del-trabajo',
    title: 'Dia del Trabajo',
    dateLabel: '1 May',
    badge: 'FERIADO',
    description: 'Ideas para aprovechar el descanso del Dia del Trabajo en la ciudad.',
    day: 1,
    month: 5,
    keywords: ['trabajo', 'descanso', 'feriado'],
    imageUrl:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'dia-de-la-madre',
    title: 'Dia de la Madre',
    dateLabel: '10 May',
    badge: 'ESPECIAL',
    description: 'Los mejores lugares para festejar a mama en GYE.',
    day: 10,
    month: 5,
    keywords: ['madre', 'mama', 'familia', 'brunch'],
    imageUrl:
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'batalla-de-pichincha',
    title: 'Batalla de Pichincha',
    dateLabel: '25 May',
    badge: 'FERIADO',
    description: 'Actividades especiales para el feriado de Batalla de Pichincha.',
    day: 25,
    month: 5,
    keywords: ['pichincha', 'historia', 'feriado'],
    imageUrl:
      'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'dia-del-nino',
    title: 'Dia del Nino',
    dateLabel: '1 Jun',
    badge: 'ESPECIAL',
    description: 'Planes divertidos y familiares para celebrar a los peques.',
    day: 1,
    month: 6,
    keywords: ['nino', 'nina', 'familia', 'kids'],
    imageUrl:
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'dia-del-padre',
    title: 'Dia del Padre',
    dateLabel: '21 Jun',
    badge: 'ESPECIAL',
    description: 'Recomendaciones para celebrar a papa con buen plan.',
    day: 21,
    month: 6,
    keywords: ['padre', 'papa', 'familia'],
    imageUrl:
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'independencia-ecuador',
    title: 'Independencia del Ecuador',
    dateLabel: '10 Ago',
    badge: 'FERIADO',
    description: 'Descubre eventos patrios y actividades para vivir esta fecha.',
    day: 10,
    month: 8,
    keywords: ['ecuador', 'patrio', 'independencia'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Flag_of_Ecuador.svg',
  },
  {
    id: 'independencia-guayaquil',
    title: 'Independencia de Guayaquil',
    dateLabel: '9 Oct',
    badge: 'FERIADO',
    description: 'Planes para celebrar a Guayaquil con orgullo y sabor local.',
    day: 9,
    month: 10,
    keywords: ['guayaquil', 'patrio', 'independencia'],
    imageUrl: 'https://res.cloudinary.com/dfyp1q7tl/image/upload/v1774592826/fiestas_de_guayaquil_wqogxl.jpg',
  },
  {
    id: 'dia-de-difuntos',
    title: 'Dia de Difuntos',
    dateLabel: '2 Nov',
    badge: 'FERIADO',
    description: 'Opciones culturales y gastronómicas para este feriado tradicional.',
    day: 2,
    month: 11,
    keywords: ['difuntos', 'colada morada', 'guagua de pan'],
    imageUrl:
      'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'navidad',
    title: 'Navidad',
    dateLabel: '25 Dic',
    badge: 'FERIADO',
    description: 'Especial navideño: lugares para vivir el espíritu de la temporada.',
    day: 25,
    month: 12,
    keywords: ['navidad', 'navideno', 'luces', 'familia'],
    imageUrl:
      'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=700&q=80',
  },
]

export function getCollectionById(id) {
  return SPECIAL_COLLECTIONS.find((item) => item.id === id) ?? null
}
