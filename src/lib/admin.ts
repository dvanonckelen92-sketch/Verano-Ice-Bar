// Verwerking van de formulieren op /beheer. Alles wat binnenkomt wordt hier
// gevalideerd voor het in de store belandt; de pagina zelf kiest enkel wat te doen.
import { DAYS, brusselsNow, type HoursData, type HoursException } from './hours';
import { slugify, type Flavour, type FlavourKind, type FlavoursData } from './store';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class FormError extends Error {}

const text = (form: FormData, key: string, max: number) => String(form.get(key) ?? '').trim().slice(0, max);

function time(form: FormData, key: string, label: string): string {
  const value = text(form, key, 5);
  if (!TIME.test(value)) throw new FormError(`${label}: vul een geldig uur in (bv. 13:00).`);
  return value;
}

function date(form: FormData, key: string, label: string): string {
  const value = text(form, key, 10);
  if (!DATE.test(value) || Number.isNaN(Date.parse(value))) throw new FormError(`${label}: vul een geldige datum in.`);
  return value;
}

function checkRange(opens: string, closes: string, label: string) {
  if (opens >= closes) throw new FormError(`${label}: het sluitingsuur moet na het openingsuur liggen.`);
}

/** Weekschema, seizoen en mededeling. */
export function parseHours(form: FormData, current: HoursData): HoursData {
  const week = { ...current.week };
  for (const d of DAYS) {
    const closed = form.get(`${d.key}-gesloten`) === 'on';
    if (closed) {
      week[d.key] = { ...week[d.key], closed: true };
      continue;
    }
    const opens = time(form, `${d.key}-open`, d.label);
    const closes = time(form, `${d.key}-dicht`, d.label);
    checkRange(opens, closes, d.label);
    week[d.key] = { closed: false, opens, closes };
  }
  const seasonStart = date(form, 'seizoen-start', 'Begin seizoen');
  const seasonEnd = date(form, 'seizoen-einde', 'Einde seizoen');
  if (seasonStart > seasonEnd) throw new FormError('Het seizoen moet eindigen na de startdatum.');

  return { ...current, week, seasonStart, seasonEnd, notice: text(form, 'mededeling', 200) };
}

export function parseException(form: FormData, current: HoursData): HoursData {
  const exceptionDate = date(form, 'datum', 'Datum');
  if (exceptionDate < brusselsNow().date) throw new FormError('Die datum ligt in het verleden.');
  const closed = form.get('gesloten') === 'on';
  const exception: HoursException = {
    date: exceptionDate,
    closed,
    opens: closed ? '' : time(form, 'open', 'Openingsuur'),
    closes: closed ? '' : time(form, 'dicht', 'Sluitingsuur'),
    note: text(form, 'reden', 80),
  };
  if (!closed) checkRange(exception.opens, exception.closes, 'Uitzondering');
  // Eén uitzondering per datum: een nieuwe vervangt de oude.
  const others = current.exceptions.filter((e) => e.date !== exceptionDate);
  return { ...current, exceptions: pruneExceptions([...others, exception]) };
}

export function removeException(dateToRemove: string, current: HoursData): HoursData {
  return { ...current, exceptions: current.exceptions.filter((e) => e.date !== dateToRemove) };
}

/** Voorbije uitzonderingen opruimen, zodat de lijst in beheer kort blijft. */
export function pruneExceptions(exceptions: HoursException[]): HoursException[] {
  const today = brusselsNow().date;
  return exceptions.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}

/** Vinkjes en mededeling uit de smakenlijst. */
export function parseAvailability(form: FormData, current: FlavoursData): FlavoursData {
  const checked = new Set(form.getAll('beschikbaar').map(String));
  return {
    ...current,
    flavours: current.flavours.map((f) => ({ ...f, available: checked.has(f.id) })),
    note: text(form, 'smaken-mededeling', 280),
  };
}

export function parseNewFlavour(form: FormData, current: FlavoursData): FlavoursData {
  const name = text(form, 'naam', 40).replace(/\s+/g, ' ');
  if (!name) throw new FormError('Geef de nieuwe smaak een naam.');
  const id = slugify(name);
  if (!id) throw new FormError('Die naam kan niet als smaak gebruikt worden.');
  if (current.flavours.some((f) => f.id === id)) throw new FormError(`"${name}" staat al in de lijst.`);
  if (current.flavours.length >= 150) throw new FormError('De lijst is vol. Verwijder eerst een paar oude smaken.');

  const kind: FlavourKind = form.get('soort') === 'sorbet' ? 'sorbet' : 'roomijs';
  const flavour: Flavour = { id, name, kind, vegan: form.get('vegan') === 'on', available: true };
  return { ...current, flavours: sortFlavours([...current.flavours, flavour]) };
}

export function removeFlavour(id: string, current: FlavoursData): FlavoursData {
  return { ...current, flavours: current.flavours.filter((f) => f.id !== id) };
}

export function sortFlavours(flavours: Flavour[]): Flavour[] {
  return [...flavours].sort((a, b) => a.name.localeCompare(b.name, 'nl'));
}
