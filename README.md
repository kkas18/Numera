# NUMERA — Kalkulator

Elegant, presis kalkulator bygd som en installerbar web-app (PWA), tilpasset Samsung Galaxy og Android.
Én HTML-fil, ingen byggesteg, ingen eksterne avhengigheter – alt (inkl. skrifter) ligger i repoet og fungerer helt offline.

## Filer

| Fil | Hva den gjør |
|---|---|
| `index.html` | Hele appen (design, motor, innstillinger, hjelp) |
| `manifest.webmanifest` | Navn, ikoner og oppførsel ved installasjon |
| `sw.js` | Service worker: offline-støtte og automatisk oppdatering |
| `icons/` | App-ikoner (vanlig + maskable), favicon og generatorskript |
| `fonts/` | Space Grotesk og IBM Plex Mono lokalt (OFL-lisens) – ingen eksterne kall |
| `test/` | Automatiske tester for regnemotoren og brukergrensesnittet |

## Publiser på GitHub Pages

1. Opprett et nytt repository på GitHub, f.eks. `numera`.
2. Last opp **alle** filene i denne mappen (behold mappestrukturen med `icons/`).
3. Gå til **Settings → Pages**. Under *Build and deployment* velger du
   **Source: Deploy from a branch**, **Branch: main**, mappe **/ (root)**. Lagre.
4. Etter et minutt er appen tilgjengelig på `https://<brukernavn>.github.io/numera/`.

Alle stier i appen er relative, så den fungerer både på rot og i en undermappe.

## Installer på Samsung Galaxy

**Samsung Internet:** åpne adressen → menyknappen → *Legg til side på* → *Startskjerm*,
eller trykk **Installer** i appens innstillinger når knappen vises.

**Chrome:** åpne adressen → menyknappen → *Installer app* / *Legg til på startskjermen*.

Appen åpner da i fullskjerm uten nettleserlinje, med eget ikon, og fungerer offline.

## Oppdatere appen

1. Gjør endringene dine i `index.html`.
2. Øk `APP_VERSION` i `index.html` og `VERSION` i `sw.js` (f.eks. `2.0.0` → `2.0.1`).
3. Push til GitHub.

Neste gang appen åpnes (eller kommer i forgrunnen) på telefonen, hentes den nye versjonen
i bakgrunnen. Er appen i bruk, vises en melding «NY VERSJON KLAR — OPPDATER»;
er den nettopp startet, byttes det automatisk uten spørsmål.

## Tester

```bash
npm install          # kun for UI-testen (jsdom)
npm test             # motor + UI
node test/engine.test.mjs   # bare motoren, ingen avhengigheter
```

## Regenerere ikoner

```bash
python3 icons/make-icons.py     # krever Pillow (pip install pillow)
```
