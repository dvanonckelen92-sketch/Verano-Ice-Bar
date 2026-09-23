// Vaste zaakgegevens. Wat de uitbaters zelf live aanpassen (openingsuren,
// uitzonderingen, smaken) staat niet hier maar in Netlify Blobs, zie src/lib/store.ts.
// Bronnen: alken.be/verano en facebook.com/Veranoicebar (geraadpleegd 2026-09-23).

export const SITE = {
  name: 'Verano Ice Bar',
  tagline: 'Dagvers, huisbereid ijs in Alken',
  url: 'https://veranoicebar.be',
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
  // Tijdens herfst en winter neemt Jurgens Christmas House de locatie over.
  winterNote: 'In het najaar en de winter maakt de zaak plaats voor Jurgens Christmas House.',
};

export const LINKS = {
  facebook: 'https://www.facebook.com/Veranoicebar/',
  instagram: 'https://www.instagram.com/verano_ice_bar_alken/',
  alkenbon: 'https://www.alkenbon.be/featured_item/verano-ice-bar/',
  route: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('Verano Ice Bar, Koutermanstraat 19, 3570 Alken')}`,
  mapsEmbed: `https://www.google.com/maps?q=${encodeURIComponent('Verano Ice Bar, Koutermanstraat 19, 3570 Alken')}&output=embed`,
  hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Verano Ice Bar, Koutermanstraat 19, 3570 Alken')}`,
};

// Wat de zaak te bieden heeft. Terras en afhalen staan op de Facebookpagina,
// WC en fietsenstalling noemde de klant zelf. De labels komen ook in de
// amenityFeature van de structured data terecht.
export const VOORZIENINGEN = [
  { label: 'Terras', detail: 'Buiten genieten van je ijsje in de zon.' },
  { label: 'IJs om mee te nemen', detail: 'Hoorntje of potje, meteen mee onderweg.' },
  { label: 'Liters ijs op bestelling', detail: 'Voor feestjes, verjaardagen of gewoon thuis.' },
  { label: 'Toilet', detail: 'Voor klanten beschikbaar.' },
  { label: 'Fietsenstalling', detail: 'Handig voor wie met de fiets langskomt.' },
  { label: 'Alkenbon aanvaard', detail: 'Betaal met de lokale cadeaubon van Alken.' },
] as const;

// Beoordeling op de Facebookpagina, zoals getoond op 2026-09-23.
export const REVIEWS = {
  source: 'Facebook',
  recommendPercent: 96,
  count: 46,
  checkedOn: '2026-09-23',
};

export const LITERS = {
  // Formaten die klanten kunnen aanvragen. Prijzen staan bewust niet op de site
  // zolang de klant ze niet doorgeeft; de zaak bevestigt elke aanvraag zelf.
  sizes: ['0,5 liter', '1 liter', '1,5 liter', '2 liter', '2,5 liter', '5 liter'],
  // Minimum aantal dagen tussen aanvraag en afhalen.
  leadDays: 2,
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
