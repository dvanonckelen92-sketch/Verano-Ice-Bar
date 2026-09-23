import type { APIRoute } from 'astro';
import { SITE, BUSINESS, LINKS, VOORZIENINGEN, LITERS } from '../consts';
import { DAYS, brusselsNow, formatDate, formatRange, upcomingExceptions } from '../lib/hours';
import { getFlavours, getHours } from '../lib/store';
import { setLiveCacheHeaders } from '../lib/cache';

// Live, net als de homepage: een antwoordmachine moet de smaken en uren van
// vandaag krijgen, niet die van de laatste build.
export const prerender = false;

export const GET: APIRoute = async () => {
  const [hours, flavours] = await Promise.all([getHours(), getFlavours()]);
  const today = brusselsNow().date;

  const week = DAYS.map((d) => {
    const day = hours.week[d.key];
    return `- ${d.label}: ${day.closed ? 'gesloten' : formatRange(day.opens, day.closes)}`;
  }).join('\n');
  const exceptions = upcomingExceptions(hours, today)
    .map((e) => `- ${formatDate(e.date)}: ${e.closed ? 'gesloten' : formatRange(e.opens, e.closes)}${e.note ? ` (${e.note})` : ''}`)
    .join('\n');
  const available = flavours.flavours.filter((f) => f.available);

  const body = `# ${SITE.name}

> ${SITE.name} is een ijssalon in ${BUSINESS.addressLocality} (België) met dagvers, huisbereid roomijs en sorbet. Open van ${formatDate(hours.seasonStart)} tot ${formatDate(hours.seasonEnd)}.

## Gegevens
- Adres: ${BUSINESS.streetAddress}, ${BUSINESS.postalCode} ${BUSINESS.addressLocality}, België
- Telefoon: ${BUSINESS.phoneIntl}
- E-mail: ${BUSINESS.email}
- Btw: ${BUSINESS.vatNumber}

## Openingsuren tijdens het seizoen
${week}
${exceptions ? `\n## Afwijkende openingsuren\n${exceptions}\n` : ''}
## Smaken vandaag (${formatDate(today)})
${available.length ? available.map((f) => `- ${f.name} (${f.kind}${f.vegan ? ', vegan' : ''})`).join('\n') : '- Nog niet bijgewerkt'}
${flavours.note ? `\n${flavours.note}\n` : ''}
## Voorzieningen
${VOORZIENINGEN.map((v) => `- ${v.label}`).join('\n')}

## Liters ijs bestellen
Formaten: ${LITERS.sizes.join(', ')}. Minstens ${LITERS.leadDays} dagen op voorhand aanvragen; de zaak bevestigt elke bestelling zelf.

## Links
- [Homepage](${SITE.url}/): smaken van vandaag, openingsuren en contact
- [Liters ijs bestellen](${SITE.url}/ijs-bestellen): aanvraagformulier voor ijs per liter
- [Facebook](${LINKS.facebook})
- [Instagram](${LINKS.instagram})
`;

  const headers = new Headers({ 'Content-Type': 'text/plain; charset=utf-8' });
  setLiveCacheHeaders(headers);
  return new Response(body, { headers });
};
