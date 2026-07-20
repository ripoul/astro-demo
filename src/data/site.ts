// Toutes les informations "réelles" du haras sont centralisées ici.
// ⚠️ Valeurs fictives pour la démo : à remplacer par les vraies coordonnées.
export const SITE = {
  name: 'Les Écuries du Vallon',
  shortName: 'Le Vallon',
  tagline: 'Pension équestre, cours et stages au cœur de la nature',
  description:
    "Pension pour chevaux de propriétaires (pré et box), cours d'équitation, stages et installations complètes : manège couvert, carrière, rond de longe et zone de pansage.",
  phone: '01 23 45 67 89',
  phoneHref: 'tel:+33123456789',
  email: 'contact@ecuries-du-vallon.fr',
  address: {
    line1: '15 chemin des Brumes',
    postalCode: '77123',
    city: 'Fontaine-la-Rivière',
    full: '15 chemin des Brumes, 77123 Fontaine-la-Rivière',
  },
  hours: [
    { day: 'Lundi – Vendredi', time: '8h00 – 19h00' },
    { day: 'Samedi', time: '9h00 – 18h00' },
    { day: 'Dimanche', time: '9h00 – 12h30' },
  ],
  social: {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
  },
  // Coordonnées d'exemple (forêt de Rambouillet) : à remplacer par l'adresse réelle du haras.
  map: {
    embedSrc: 'https://www.google.com/maps?q=48.6427,1.8305&z=14&output=embed',
    linkHref: 'https://www.google.com/maps?q=48.6427,1.8305&z=14',
  },
} as const;

export type NavLink = {
  href: string;
  label: string;
};

export const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Accueil' },
  { href: '/installations', label: 'Installations' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/blog', label: 'Actualités' },
  { href: '/contact', label: 'Contact' },
];
