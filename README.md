# NUMERA

En kalkulator for mobil. Installeres på hjemskjermen og virker uten nett.

## Filer

```
index.html              hele appen (grensesnitt + regnemotor)
manifest.webmanifest    PWA-manifest
sw.js                   service worker (offline + oppdatering)
.nojekyll               ber GitHub Pages servere filene som de er
icons/                  app-ikoner (SVG + PNG, vanlige og maskerbare)
tests/engine.test.js    103 tester av regnemotoren
tests/ui.test.js        40 tester av grensesnittet og PWA-oppsettet
```

Alle stier er relative (`./`), så appen virker både på
`brukernavn.github.io` og på `brukernavn.github.io/repo/`.

## Legg den ut på GitHub Pages

1. Lag et nytt repo på GitHub, for eksempel `numera`.
2. Last opp alle filene i denne mappen til rota av repoet — ikke inni en
   undermappe, med mindre du også flytter `icons/` med.
3. Gå til **Settings → Pages**.
4. Under *Source*, velg **Deploy from a branch**.
5. Velg branch `main` og mappe `/ (root)`. Trykk **Save**.
6. Vent et par minutter. Adressen blir
   `https://brukernavn.github.io/numera/`.

Via kommandolinjen:

```bash
git init
git add .
git commit -m "NUMERA 1.0.0"
git branch -M main
git remote add origin https://github.com/BRUKERNAVN/numera.git
git push -u origin main
```

GitHub Pages leverer over HTTPS, som er kravet for at service workeren
og installasjonen skal virke.

## Installer på Samsung-telefonen

**Samsung Internet:** åpne adressen, trykk menyknappen nederst og velg
*Legg til side i → Startskjerm*. Eller trykk nedlastingsikonet oppe til
høyre i appen.

**Chrome:** åpne adressen, trykk trepunktsmenyen og velg *Installer app*.

Etter installasjon starter appen i fullskjerm uten adressefelt, og alt
regnestoffet ligger lokalt — den virker i flymodus.

## Slik oppdaterer du appen

Endre filene, øk `VERSION` øverst i `sw.js`, og push. Neste gang appen
åpnes lastes den nye versjonen ned i bakgrunnen, og du får en melding
nederst på skjermen som du kan trykke på for å ta den i bruk.

## Kjør testene

```bash
node tests/engine.test.js     # regnemotoren, ingen avhengigheter
npm install jsdom
node tests/ui.test.js         # grensesnittet og PWA-filene
```

`engine.test.js` henter motoren rett ut av `index.html`, så testene
kjører alltid på koden som faktisk sendes til telefonen.

## Tastatursnarveier

| Tast | Handling |
|---|---|
| `0`–`9` | siffer |
| `+ - * /` | regneartene |
| `,` `.` | desimaltegn |
| `%` `!` `^` `(` `)` | prosent, fakultet, potens, parenteser |
| `p` `e` | π og e |
| `Enter` `=` | regn ut |
| `Backspace` | slett siste |
| `Delete` | nullstill |
| `Esc` | lukk panel |

## Gester

- **Hold inne tallet** i vinduet for å kopiere det.
- **Sveip sidelengs** over vinduet for å slette siste tegn.
- **Hold inne slettetasten** for å nullstille alt.
- **Dra arket nedover** for å lukke historikk og innstillinger.

## Lisens

Lag din egen versjon som du vil.
