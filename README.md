# NUMERA

En kalkulator for mobil. Installeres på hjemskjermen og virker uten nett.

## Filer

```
index.html              hele appen (grensesnitt + regnemotor)
manifest.webmanifest    PWA-manifest
sw.js                   service worker (offline + oppdatering)
.nojekyll               ber GitHub Pages servere filene som de er
icons/                  app-ikoner (SVG + PNG, vanlige og maskerbare)
tests/engine.test.js    206 tester av regnemotoren og hjelpeeksemplene
tests/ui.test.js        86 tester av grensesnittet og PWA-oppsettet
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
git commit -m "NUMERA 1.4.0"
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

Push endringene til GitHub. Det er alt — du trenger ikke telle versjoner
eller endre noe i `sw.js`.

Appen kjenner igjen nye filer på ETag-en serveren sender, ikke på et
versjonsnummer du må huske å skru opp. Tre ting skjer:

- **Neste gang appen åpnes** henter den siden på nytt fra nettet og
  bruker den nye utgaven med en gang. Svarer ikke serveren innen 700 ms,
  starter appen fra hurtiglageret i stedet, og bytter når den friske
  utgaven kommer.
- **Står appen allerede åpen**, ser den etter nye filer hver gang den
  kommer i forgrunnen (maks én sjekk i minuttet) og når telefonen får
  nett igjen.
- **Er du midt i et regnestykke**, avbrytes du ikke. Du får en melding
  nederst du kan trykke på når det passer. Er skjermen tom, oppdateres
  appen stille.

Under *Innstillinger → Oppdatering* kan du også se etter nye filer selv.

`VERSION` øverst i `sw.js` trenger du bare å endre hvis du legger til
eller fjerner filer i `icons/` — den styrer bare navnet på hurtiglageret.

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

## Forklaringer

Spørsmålstegnet i toppen åpner en liste over hva hver tast gjør, med et
regnestykke du kan trykke **Prøv** på for å se det kjøre i kalkulatoren.

Holder du inne en funksjonstast, får du et kort med **bare den ene
tasten** — ikke hele listen. Trykket blir angret først, så du mister ikke
regnestykket du holdt på med. Nederst på kortet ligger en lenke til hele
oversikten hvis du vil videre.

Sifre og regneartene har ingen forklaring, og der skjer det ingenting ved
langt trykk.

Innholdet ligger i `HELP`-blokken i `index.html`. Hvert eksempel kjøres
gjennom regnemotoren i testene, så en forklaring kan aldri love et svar
kalkulatoren ikke gir.

## Vitenskapelige funksjoner

Håndtaket midt på streken over tastene slår dem av og på med ett trykk.
Du kan også sveipe nedover på tallvinduet for å hente dem fram, og
oppover for å skjule dem igjen. Valget huskes til neste gang.

## Gester

- **Hold inne en funksjonstast** for å se hva den gjør, med eksempel.
- **Trykk håndtaket** over tastene for trigonometri, logaritmer og potenser.
- **Sveip ned eller opp** på vinduet for det samme.
- **Hold inne tallet** i vinduet for å kopiere det.
- **Sveip sidelengs** over vinduet for å slette siste tegn.
- **Hold inne slettetasten** for å nullstille alt.
- **Dra arket nedover** for å lukke historikk og innstillinger.

## Lisens

Lag din egen versjon som du vil.
