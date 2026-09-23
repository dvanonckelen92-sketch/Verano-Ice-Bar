// Openingsuren: types en rekenwerk. Puur TypeScript zonder serverafhankelijkheden,
// zodat de homepage dezelfde logica in de browser kan draaien voor de live status.

export const TIME_ZONE = 'Europe/Brussels';

// Volgorde maandag → zondag. `schema` volgt schema.org (https://schema.org/Monday).
export const DAYS = [
  { key: 'ma', label: 'Maandag', schema: 'Monday' },
  { key: 'di', label: 'Dinsdag', schema: 'Tuesday' },
  { key: 'wo', label: 'Woensdag', schema: 'Wednesday' },
  { key: 'do', label: 'Donderdag', schema: 'Thursday' },
  { key: 'vr', label: 'Vrijdag', schema: 'Friday' },
  { key: 'za', label: 'Zaterdag', schema: 'Saturday' },
  { key: 'zo', label: 'Zondag', schema: 'Sunday' },
] as const;

export type DayKey = (typeof DAYS)[number]['key'];

export type DayHours = { closed: boolean; opens: string; closes: string };

/** Afwijking op één datum: gesloten, of andere uren. */
export type HoursException = {
  date: string; // YYYY-MM-DD
  closed: boolean;
  opens: string;
  closes: string;
  note: string;
};

export type HoursData = {
  week: Record<DayKey, DayHours>;
  exceptions: HoursException[];
  /** Seizoen als YYYY-MM-DD. Buiten deze periode is de zaak dicht. */
  seasonStart: string;
  seasonEnd: string;
  /** Vrije mededeling bovenaan de site, leeg = niet tonen. */
  notice: string;
  updatedAt: string | null;
};

export type DayResolution = {
  date: string;
  open: boolean;
  opens: string | null;
  closes: string | null;
  /** Waarom de dag afwijkt van het gewone weekschema, indien van toepassing. */
  reason: 'season' | 'exception' | null;
  note: string;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Huidige datum (YYYY-MM-DD) en minuten sinds middernacht in Brussel. */
export function brusselsNow(now = new Date()): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Datum verschuiven met een aantal dagen. Rekent in UTC, dus zonder DST-gedoe. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** 0 = maandag … 6 = zondag. */
export function weekdayIndex(date: string): number {
  return (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
}

export function resolveDay(data: HoursData, date: string): DayResolution {
  const exception = data.exceptions.find((e) => e.date === date);
  if (exception) {
    return {
      date,
      open: !exception.closed,
      opens: exception.closed ? null : exception.opens,
      closes: exception.closed ? null : exception.closes,
      reason: 'exception',
      note: exception.note,
    };
  }
  if (date < data.seasonStart || date > data.seasonEnd) {
    return { date, open: false, opens: null, closes: null, reason: 'season', note: '' };
  }
  const day = data.week[DAYS[weekdayIndex(date)].key];
  return {
    date,
    open: !day.closed,
    opens: day.closed ? null : day.opens,
    closes: day.closed ? null : day.closes,
    reason: null,
    note: '',
  };
}

/** Eerstvolgende dag (vanaf `from`, die dag inbegrepen) waarop de zaak open is. */
export function nextOpenDay(data: HoursData, from: string, maxDays = 400): DayResolution | null {
  for (let i = 0; i < maxDays; i++) {
    const day = resolveDay(data, addDays(from, i));
    if (day.open) return day;
  }
  return null;
}

const dateFormatter = new Intl.DateTimeFormat('nl-BE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

/** "zaterdag 3 oktober" */
export function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T12:00:00Z`));
}

export function formatRange(opens: string, closes: string): string {
  return `${opens} tot ${closes}`;
}

export type OpenStatus = { open: boolean; label: string };

/** De zin in de statusbadge: "Nu open tot 21:00", "Vandaag open vanaf 13:00", … */
export function openStatus(data: HoursData, now = new Date()): OpenStatus {
  const { date, minutes } = brusselsNow(now);
  const today = resolveDay(data, date);

  if (today.open && today.opens && today.closes) {
    const opens = toMinutes(today.opens);
    const closes = toMinutes(today.closes);
    if (minutes >= opens && minutes < closes) {
      return { open: true, label: `Nu open tot ${today.closes}` };
    }
    if (minutes < opens) {
      return { open: false, label: `Vandaag open vanaf ${today.opens}` };
    }
  }

  const next = nextOpenDay(data, addDays(date, 1));
  if (!next || !next.opens) return { open: false, label: 'Momenteel gesloten' };
  if (next.date === addDays(date, 1)) {
    return { open: false, label: `Nu gesloten, morgen open vanaf ${next.opens}` };
  }
  if (today.reason === 'season') {
    return { open: false, label: `Winterstop, terug open op ${formatDate(next.date)}` };
  }
  return { open: false, label: `Nu gesloten, weer open op ${formatDate(next.date)}` };
}

/** Uitzonderingen vanaf vandaag, gesorteerd. */
export function upcomingExceptions(data: HoursData, today: string, days = 60): HoursException[] {
  const until = addDays(today, days);
  return data.exceptions
    .filter((e) => e.date >= today && e.date <= until)
    .sort((a, b) => a.date.localeCompare(b.date));
}
