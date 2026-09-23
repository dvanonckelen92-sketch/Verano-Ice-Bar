import { createHash, timingSafeEqual } from 'node:crypto';
import { BEHEER_GEBRUIKER, BEHEER_WACHTWOORD } from 'astro:env/server';

const MIN_PASSWORD_LENGTH = 10;

/** Waarom de login niet ingesteld is, of null als alles in orde is. */
export function loginConfigProblem(): string | null {
  if (!BEHEER_GEBRUIKER || !BEHEER_WACHTWOORD) {
    return 'De login is nog niet ingesteld: BEHEER_GEBRUIKER en BEHEER_WACHTWOORD ontbreken in de Netlify-omgevingsvariabelen.';
  }
  if (BEHEER_WACHTWOORD.length < MIN_PASSWORD_LENGTH) {
    return `BEHEER_WACHTWOORD is te kort: gebruik minstens ${MIN_PASSWORD_LENGTH} tekens.`;
  }
  return null;
}

// Beide kanten eerst hashen: timingSafeEqual vereist even lange buffers, en zo
// lekt ook de lengte van het wachtwoord niet via de responstijd.
const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest();

export function checkCredentials(username: string, password: string): boolean {
  if (loginConfigProblem() || !BEHEER_GEBRUIKER || !BEHEER_WACHTWOORD) return false;
  const userOk = timingSafeEqual(digest(username.trim().toLowerCase()), digest(BEHEER_GEBRUIKER.toLowerCase()));
  const passOk = timingSafeEqual(digest(password), digest(BEHEER_WACHTWOORD));
  return userOk && passOk;
}

export const SESSION_KEY = 'beheerder';
