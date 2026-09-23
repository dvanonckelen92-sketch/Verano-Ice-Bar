// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

// TODO: definitief domein bevestigen met de klant voor livegang.
const SITE_URL = 'https://veranoicebar.be';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',

  // Standaard statisch. Enkel de homepage (live smaken en uren), /llms.txt en
  // /beheer draaien on demand; zie `export const prerender = false` daar.
  adapter: netlify({
    // Geen Edge Functions nodig. De lokale Deno-emulatie ervan crasht op dit
    // systeem (zelfde probleem als in diamondsregistratie), dus uit in dev.
    devFeatures: {
      edgeFunctions: false,
      images: true,
      environmentVariables: true,
    },
  }),

  // Sessies (enkel gebruikt door /beheer) bewaart de adapter in Netlify Blobs.
  // 30 dagen, zodat de uitbaters niet elke dag opnieuw moeten aanmelden op hun gsm.
  session: {
    ttl: 60 * 60 * 24 * 30,
    cookie: {
      name: 'verano_beheer',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
  },

  env: {
    schema: {
      // Vaste login voor de beheerpagina. In te stellen in Netlify onder
      // Site configuration > Environment variables, lokaal in `.env`.
      // Optioneel: een ontbrekende of te korte waarde mag /beheer niet laten
      // crashen. src/lib/auth.ts controleert ze en de pagina meldt wat er mist.
      BEHEER_GEBRUIKER: envField.string({ context: 'server', access: 'secret', optional: true }),
      BEHEER_WACHTWOORD: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Fredoka',
      cssVariable: '--font-fredoka',
      weights: [500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-rounded', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Nunito',
      cssVariable: '--font-nunito',
      weights: [400, 600, 700, 800],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      // De homepage wordt on demand gerenderd en dus niet automatisch opgepikt.
      customPages: [`${SITE_URL}/`],
      filter: (page) => !page.includes('/beheer') && !page.includes('/bedankt'),
    }),
  ],
});
