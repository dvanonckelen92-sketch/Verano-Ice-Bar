# Verano Ice Bar

Website voor Verano Ice Bar, ijssalon op de Koutermanstraat 19 in Alken.
Astro 7 op Netlify, met een beheerpagina waar de uitbaters zelf de smaken
van vandaag en de openingsuren aanpassen.

## Pagina's

| URL | Rendering | Inhoud |
|---|---|---|
| `/` | on demand, 5 min CDN-cache | Live status, smaken, uren, voorzieningen, FAQ, contact |
| `/ijs-bestellen` | statisch | Aanvraagformulier liters ijs (Netlify Forms) |
| `/privacybeleid` | statisch | |
| `/llms.txt` | on demand | Samenvatting voor AI-assistenten, met live smaken en uren |
| `/beheer` | on demand | Beheer, enkel via de URL, niet geïndexeerd |

## Beheer

De beheerpagina (`/beheer`) werkt met één vaste login uit twee omgevingsvariabelen:

- `BEHEER_GEBRUIKER`
- `BEHEER_WACHTWOORD` (minstens 10 tekens)

Zet ze in Netlify onder *Site configuration > Environment variables*, lokaal in
`.env` (zie `.env.example`). Na vijf mislukte pogingen blijft de login voor dat
IP-adres een kwartier dicht. Een sessie blijft 30 dagen geldig.

Wat de uitbaters kunnen aanpassen:

- **Smaken**: aanvinken wat in de toonbank ligt, smaken toevoegen of verwijderen,
  een korte mededeling bij de smaken.
- **Openingsuren** per weekdag, het seizoen (begin- en einddatum) en een
  mededelingsbalk bovenaan de site.
- **Uitzonderingen**: een datum gesloten of met andere uren. Voorbije datums
  verdwijnen vanzelf.

Alles wordt bewaard in Netlify Blobs (store `verano`). Na elke wijziging wist de
site de CDN-cache van de homepage en `llms.txt` (cache-tag `live`), zodat de
aanpassing meteen zichtbaar is.

## Liters ijs aanvragen

Het formulier op `/ijs-bestellen` gebruikt Netlify Forms (formulier `liters-ijs`).
Na de eerste deploy: zet in Netlify onder *Forms > Form notifications* een
e-mailmelding naar het adres van de zaak.

## Nog aan te leveren door de klant

- **Logo**: `src/assets/logo.svg` is een voorlopige natekening. Vervang door het
  originele bestand en draai `node scripts/og-image.mjs` voor de deelafbeelding.
  Kopieer het logo ook naar `public/favicon.svg`.
- **Sfeerfoto's**: zet ze in `src/assets/sfeer/`. De sectie verschijnt vanzelf
  zodra er foto's staan. De bestandsnaam wordt de alt-tekst en bepaalt de
  volgorde, bv. `01-terras-in-de-zon.jpg`.
- **Domein**: `veranoicebar.be` is een aanname in `astro.config.mjs`,
  `src/consts.ts`, `public/robots.txt` en `netlify.toml`.
- **Smakenlijst**: de startlijst is een voorbeeld. De uitbaters vullen hun eigen
  smaken aan in `/beheer`.

## Ontwikkelen

```
npm install
npm run dev
```

De Netlify Vite-plugin emuleert Blobs lokaal in `.netlify/blobs-serve`. Let op:
`npm run build` maakt `.netlify/` leeg, dus lokale testgegevens zijn daarna weg.
Live heeft dat geen invloed.

Krijg je lokaal `MissingBlobsEnvironmentError`? Dan heeft de dev-server zichzelf
herstart na een wijziging aan `astro.config.mjs` en is de Blobs-emulatie van
`@netlify/vite-plugin` daarbij verloren gegaan. Stop de server (Ctrl+C) en
start `npm run dev` opnieuw.

`npm audit` meldt kwetsbaarheden in `extract-zip` en `sharp` onder `ipx`: dat
zijn dev-tools van `@netlify/vite-plugin`, niet wat live draait.
