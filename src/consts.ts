// Vaste zaakgegevens. Wat de uitbaters zelf live aanpassen (openingsuren,
// uitzonderingen, smaken) staat niet hier maar in Netlify Blobs, zie src/lib/store.ts.
// Bronnen: alken.be/verano en facebook.com/Veranoicebar (geraadpleegd 2026-09-23).

export const SITE = {
  name: 'Verano Ice Bar',
  tagline: 'Dagvers, huisbereid ijs in Alken',
  url: 'https://verano-icebar-alken.be',
  locale: 'nl_BE',
  language: 'nl',
};

export const BUSINESS = {
  owner: 'Jan Timmers',
  streetAddress: 'Koutermanstraat 19',
  postalCode: '3570',
  addressLocality: 'Alken',
  addressCountry: 'BE',
  phone: '0477 78 08 37',
  phoneIntl: '+32 477 78 08 37',
  phoneHref: 'tel:+32477780837',
  email: 'jantimmers@gmail.com',
  vatNumber: 'BE 0679.762.340',
};

export const LINKS = {
  facebook: 'https://www.facebook.com/Veranoicebar/',
  instagram: 'https://www.instagram.com/verano_ice_bar_alken/',
  alkenbon: 'https://www.alkenbon.be/featured_item/verano-ice-bar/',
  route: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('Verano Ice Bar, Koutermanstraat 19, 3570 Alken')}`,
  mapsEmbed: `https://www.google.com/maps?q=${encodeURIComponent('Verano Ice Bar, Koutermanstraat 19, 3570 Alken')}&output=embed`,
  hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Verano Ice Bar, Koutermanstraat 19, 3570 Alken')}`,
};

// Wat de zaak te bieden heeft. Afhalen staat op de Facebookpagina, de rest
// gaf de klant zelf door (laatst op 2026-10-14). De labels komen ook in de
// amenityFeature van de structured data terecht.
export const VOORZIENINGEN = [
  { label: 'Binnen- en buitenterras', detail: 'Zon of regen, er is altijd een plek voor je ijsje.' },
  { label: 'Gratis parking', detail: 'Parkeer gratis vlak bij de ijsbar.' },
  { label: 'Elektrisch laden', detail: 'Laad je elektrische auto op de parking terwijl je van je ijsje geniet.' },
  { label: 'Fietsen laden', detail: 'Ook je e-bike kan hier even bijladen.' },
  { label: 'Fietsenstalling', detail: 'Handig voor wie met de fiets langskomt.' },
  { label: 'Toilet', detail: 'Voor klanten beschikbaar.' },
  { label: 'IJs om mee te nemen', detail: 'Hoorntje of potje, meteen mee onderweg.' },
  { label: 'Liters ijs op bestelling', detail: 'Voor feestjes, verjaardagen of gewoon thuis.' },
  { label: 'Alkenbon aanvaard', detail: 'Betaal met de lokale cadeaubon van Alken.' },
] as const;

// Wat er in de buurt te doen is. Bewust niet in amenityFeature: dat zijn geen
// voorzieningen van de zaak zelf.
export const IN_DE_BUURT = [
  { label: 'Speeltuin op wandelafstand', detail: 'De kinderen kunnen zich uitleven, met een ijsje als beloning.' },
  { label: 'Minigolf op wandelafstand', detail: 'Een partijtje minigolf en daarna een ijsje.' },
  { label: 'Vertrekpunt van fiets- en wandelroutes', detail: 'Start je tocht hier, of kom op het einde iets lekkers halen.' },
] as const;

// Beoordeling op de Facebookpagina, zoals getoond op 2026-09-23.
export const REVIEWS = {
  source: 'Facebook',
  recommendPercent: 96,
  count: 46,
  checkedOn: '2026-09-23',
};

export const LITERS = {
  // Enkel potten van 1 liter, aan 15 euro per liter (klant, 2026-10-14).
  pricePerLiter: 15,
  // Minimum aantal dagen tussen aanvraag en afhalen.
  leadDays: 3,
};

export const AGENCY = {
  name: 'Coop Consult',
  url: 'https://coopconsult.be',
};

export const HOSTING = {
  provider: 'Netlify, Inc.',
  providerAddress: '512 2nd Street, Suite 200, San Francisco, CA 94107, Verenigde Staten',
  privacyPolicyUrl: 'https://www.netlify.com/privacy/',
};
