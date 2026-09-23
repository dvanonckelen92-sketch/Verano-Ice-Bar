import { createHash, timingSafeEqual } from 'node:crypto';
import { BEHEER_GEBRUIKER, BEHEER_WACHTWOORD } from 'astro:env/server';

// Beide kanten eerst hashen: timingSafeEqual vereist even lange buffers, en zo
// lekt ook de lengte van het wachtwoord niet via de responstijd.
const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest();

export function checkCredentials(username: string, password: string): boolean {
  const userOk = timingSafeEqual(digest(username.trim().toLowerCase()), digest(BEHEER_GEBRUIKER.toLowerCase()));
  const passOk = timingSafeEqual(digest(password), digest(BEHEER_WACHTWOORD));
  return userOk && passOk;
}

export const SESSION_KEY = 'beheerder';
