# TargetCoach Basis

Gratis versie van TargetCoach zonder AI. Werkt zonder account en kan als app op een
telefoon worden gezet (PWA).

- **Vragenlijst** (gezondheidscheck op basis van PAR-Q+, doel, niveau, ervaring, dagen, datum)
- **Plan op maat** met vaste regels uit de kennisbank (zie `planregels.js`)
- **Logboek** met reactie na elke training, "Herhaal deze week" bij pijn of als het te zwaar is
- **Mijlpalen** en een **tip van de week**
- **Gedeelde plannen**: een plan dat met de AI-coach is gemaakt, opent via een link in Basis
- Alles wordt alleen op het eigen apparaat bewaard

## Bestanden

| Bestand | Wat |
|---|---|
| `index.html` | De app |
| `planregels.js` | De regels die het plan maken |
| `manifest.webmanifest`, `sw.js` | Maken de app installeerbaar en bruikbaar zonder internet |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | App-icoontjes |

## Online zetten (gratis, via GitHub en Vercel)

1. Ga naar github.com, klik **New repository**, noem hem `targetcoach-basis`,
   kies **Public** en klik **Create repository**.
2. Klik **uploading an existing file** en sleep **alle bestanden uit deze map**
   erin (niet de map zelf). Klik **Commit changes**.
3. Ga naar vercel.com, klik **Add New → Project**, kies `targetcoach-basis` en klik **Deploy**.
   Er zijn geen instellingen nodig.
4. Je krijgt een link, bijvoorbeeld `https://targetcoach-basis.vercel.app`.
   Die kun je in je portfolio zetten.
5. Geef de link aan Claude. Dan komt in TargetCoach (met AI) de knop
   **Deel plan als link**, die plannen naar Basis stuurt.

Iets aanpassen? Upload het gewijzigde bestand opnieuw in GitHub; Vercel zet de nieuwe
versie vanzelf online.
