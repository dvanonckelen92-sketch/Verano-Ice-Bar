import { purgeCache } from '@netlify/functions';

// Pagina's met live gegevens krijgen deze tag, zodat een wijziging in /beheer
// ze meteen uit de Netlify-CDN haalt in plaats van de cachetijd af te wachten.
export const LIVE_CACHE_TAG = 'live';

/** Headers voor een on-demand pagina die live gegevens toont. */
export function setLiveCacheHeaders(headers: Headers): void {
  // Browser: altijd opnieuw vragen. CDN: 5 minuten bewaren, zodat de dagwissel
  // en uitzonderingen vanzelf doorkomen, en tot dan meteen wissen bij een wijziging.
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  headers.set('Netlify-CDN-Cache-Control', 'public, durable, s-maxage=300, stale-while-revalidate=60');
  headers.set('Netlify-Cache-Tag', LIVE_CACHE_TAG);
}

export async function purgeLivePages(): Promise<void> {
  try {
    await purgeCache({ tags: [LIVE_CACHE_TAG] });
  } catch (error) {
    // Lokaal is er geen CDN; daar faalt dit altijd en is dat geen probleem.
    if (import.meta.env.PROD) console.error('CDN-cache wissen mislukt', error);
  }
}
