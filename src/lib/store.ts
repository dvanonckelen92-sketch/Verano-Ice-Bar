// Live gegevens die de uitbaters via /beheer aanpassen, bewaard in Netlify Blobs.
// Lokaal (astro dev) emuleert de Netlify Vite-plugin dezelfde store.
import { getStore } from '@netlify/blobs';
import { DAYS, type HoursData } from './hours';

export type FlavourKind = 'roomijs' | 'sorbet';

export type Flavour = {
  id: string;
  name: string;
  kind: FlavourKind;
  vegan: boolean;
  available: boolean;
};

export type FlavoursData = {
  flavours: Flavour[];
  /** Korte mededeling bij de smaken, bv. "Pistache is op, morgen terug". */
  note: string;
  updatedAt: string | null;
};

const STORE_NAME = 'verano';
const KEYS = { hours: 'openingsuren', flavours: 'smaken' } as const;

const store = () => getStore({ name: STORE_NAME, consistency: 'strong' });

// Startwaarden tot de uitbaters iets opslaan. Uren volgens alken.be en Facebook
// (2026-09-23): 13u tot 21u, dinsdag rustdag. De klant start terug in februari
// 2027 (doorgegeven 2026-10-14); de exacte dag stellen ze in /beheer in.
export const DEFAULT_HOURS: HoursData = {
  week: Object.fromEntries(
    DAYS.map((d) => [d.key, { closed: d.key === 'di', opens: '13:00', closes: '21:00' }]),
  ) as HoursData['week'],
  exceptions: [],
  winterStart: '2026-11-01',
  reopenDate: '2027-02-01',
  notice: '',
  updatedAt: null,
};

// Voorlopige lijst zodat de beheerpagina niet leeg start. De uitbaters vullen
// hun echte smaken aan en vinken aan wat er vandaag in de toonbank ligt.
const STARTER_FLAVOURS: Array<[string, FlavourKind, boolean]> = [
  ['Vanille', 'roomijs', false],
  ['Chocolade', 'roomijs', false],
  ['Stracciatella', 'roomijs', false],
  ['Mokka', 'roomijs', false],
  ['Speculoos', 'roomijs', false],
  ['Pistache', 'roomijs', false],
  ['Hazelnoot', 'roomijs', false],
  ['Aardbei', 'roomijs', false],
  ['Yoghurt bosvruchten', 'roomijs', false],
  ['Citroen', 'sorbet', true],
  ['Mango', 'sorbet', true],
  ['Framboos', 'sorbet', true],
];

export const DEFAULT_FLAVOURS: FlavoursData = {
  flavours: STARTER_FLAVOURS.map(([name, kind, vegan]) => ({
    id: slugify(name),
    name,
    kind,
    vegan,
    available: true,
  })),
  note: '',
  updatedAt: null,
};

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = (await store().get(key, { type: 'json' })) as T | null;
    return value ? { ...fallback, ...value } : structuredClone(fallback);
  } catch (error) {
    // Een onbereikbare store mag de publieke site nooit platleggen.
    console.error(`Blob "${key}" lezen mislukt`, error);
    return structuredClone(fallback);
  }
}

export async function getHours(): Promise<HoursData> {
  // Oudere versies bewaarden een seizoen (seasonStart/seasonEnd). Dat model is
  // vervangen door de winterstop; de oude velden laten we hier vallen.
  const { seasonStart: _start, seasonEnd: _end, ...hours } = (await read(KEYS.hours, DEFAULT_HOURS)) as HoursData & {
    seasonStart?: string;
    seasonEnd?: string;
  };
  return hours;
}
export const getFlavours = () => read(KEYS.flavours, DEFAULT_FLAVOURS);

export async function saveHours(data: HoursData): Promise<void> {
  await store().setJSON(KEYS.hours, { ...data, updatedAt: new Date().toISOString() });
}

export async function saveFlavours(data: FlavoursData): Promise<void> {
  await store().setJSON(KEYS.flavours, { ...data, updatedAt: new Date().toISOString() });
}

// --- Aanmeldpogingen ------------------------------------------------------
// Na MAX_ATTEMPTS mislukte pogingen vanaf één IP-adres blijft de login
// LOCK_MINUTES dicht. Eenvoudig, maar genoeg tegen wachtwoord raden.

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

type Attempts = { count: number; first: number };

const attemptsKey = (ip: string) => `login-pogingen/${slugify(ip) || 'onbekend'}`;

export async function isLockedOut(ip: string): Promise<boolean> {
  const attempts = (await store().get(attemptsKey(ip), { type: 'json' })) as Attempts | null;
  if (!attempts) return false;
  if (Date.now() - attempts.first > LOCK_MINUTES * 60_000) return false;
  return attempts.count >= MAX_ATTEMPTS;
}

export async function registerFailedLogin(ip: string): Promise<void> {
  const key = attemptsKey(ip);
  const current = (await store().get(key, { type: 'json' })) as Attempts | null;
  const expired = !current || Date.now() - current.first > LOCK_MINUTES * 60_000;
  await store().setJSON(key, expired ? { count: 1, first: Date.now() } : { ...current, count: current.count + 1 });
}

export async function clearFailedLogins(ip: string): Promise<void> {
  await store().delete(attemptsKey(ip));
}
