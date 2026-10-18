// TargetCoach Basis – planregels.
// Maakt een trainingsplan met vaste regels uit de kennisbank van TargetCoach:
// - rustig opbouwen, vooral in de eerste weken (bron 7: Buist 2008, Nielsen 2014; bron 11: Damsted 2019)
// - na elke 2 weken opbouwen een rustigere week (bron 11, praktijkrichtlijn)
// - beginners geen intervallen, gevorderden hooguit 1 zwaardere training per week (bron 11: Seiler 2010; bron 13)
// - lange duurloop vanaf 10 km (bron 11), afbouwen voor halve en hele marathon (bron 11: Bosquet 2007, Smyth & Lawlor 2021)
// - marathon: toewerken naar ongeveer 30 km per week (bron 11: Rasmussen 2013), wandelpauzes mogen (bron 13: Hottenrott 2016)
// - gebruikelijke opbouwduur per afstand (bron 11, praktijkrichtlijn)
// De schema's zijn eigen schema's volgens deze principes, geen kopie van een bestaand programma.
const TCPlan = (() => {
  "use strict";
  const DAGNAMEN = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
  const Groot = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const rond5 = (x) => Math.max(5, Math.round(x / 5) * 5);
  const DAG = 86400000;
  const dagNr = (iso) => Math.floor(Date.parse(iso + "T12:00:00") / DAG);
  const plusDagen = (iso, n) => { const d = new Date(Date.parse(iso + "T12:00:00") + n * DAG), p = (x) => String(x).padStart(2, "0"); return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); };

  const NIVEAUS = [
    { id: 0, t: "Nog niet, of korter dan 5 minuten" },
    { id: 1, t: "5 tot 10 minuten" },
    { id: 2, t: "15 tot 20 minuten" },
    { id: 3, t: "Ongeveer 30 minuten (rond de 5 km)" },
    { id: 4, t: "45 tot 60 minuten (8 tot 10 km)" },
    { id: 5, t: "75 minuten of langer (15 km of meer)" },
  ];
  const DOELEN = {
    fit: { t: "Fitter worden", u: "30 minuten aan één stuk hardlopen", kort: "30 minuten aan één stuk hardlopen" },
    k5: { t: "5 km", u: "5 km hardlopen", kort: "5 km hardlopen" },
    k10: { t: "10 km", u: "10 km hardlopen", kort: "10 km hardlopen" },
    half: { t: "Halve marathon", u: "21,1 km", kort: "Een halve marathon lopen (21,1 km)" },
    mar: { t: "Marathon", u: "42,2 km", kort: "Een marathon lopen (42,2 km)" },
  };

  // Fase A: van wandelen-en-hardlopen naar 30 minuten aan één stuk. [hardlopen, wandelen, herhalingen]
  const LADDER = [[1, 2, 8], [2, 2, 6], [3, 2, 5], [5, 2, 4], [7, 2, 3], [10, 2, 3], [15, 2, 2], [20, 0, 1], [25, 0, 1], [30, 0, 1]];
  const START_STAP = [0, 3, 7]; // per niveau 0-2
  const stapTekst = (s) => { const [r, w, n] = LADDER[s]; return n > 1 ? n + " × " + r + " min hardlopen, " + w + " min wandelen" : r + " min rustig hardlopen, aan één stuk"; };
  const stapMin = (s) => { const [r, w, n] = LADDER[s]; return n > 1 ? n * (r + w) : r; };

  // Huidige lange duur (minuten aan één stuk) per niveau 3-5.
  const KAN = { 3: 30, 4: 50, 5: 80 };
  const PIEK = { k5: 45, fit: 45, k10: 65, half: 110, mar: 180 };
  const MIN_WEKEN = { fit: 6, k5: 6, k10: 8, half: 12, mar: 16 };

  function ladderD(van, piek, maxStap) {
    const uit = []; let lang = van, sinds = 0;
    while (lang < piek) {
      lang = Math.min(piek, lang + Math.max(5, Math.min(maxStap, rond5(lang * 0.15))));
      uit.push({ type: "D", lang });
      if (++sinds === 2 && lang < piek) { uit.push({ type: "D", lang: rond5(lang * 0.75), herstel: true }); sinds = 0; }
    }
    return uit;
  }

  // Bepaalt de weken (als "bouwstenen") voor een doel. Geeft ook blokkades en waarschuwingen terug.
  function bouwstenen(a) {
    const n = a.niveau, d = a.doel, uit = { stenen: [], staart: [], blok: null, notities: [] };
    if (d === "mar" && (n < 4 || !a.halveGedaan)) {
      uit.blok = { tekst: "Voor een marathon is het verstandig om eerst een halve marathon te lopen en al een paar maanden regelmatig 45-60 minuten of langer te kunnen hardlopen. Dat verkleint de kans op blessures.", ander: "half" };
      return uit;
    }
    // Fase A als de basis van 30 minuten er nog niet is.
    if (n <= 2) for (let s = START_STAP[n]; s < LADDER.length; s++) uit.stenen.push({ type: "A", stap: s });
    const kan = n <= 2 ? 30 : KAN[n];
    if (d === "fit") {
      if (n <= 2) return uit;
      uit.notities.push(n === 3 ? "Je kunt al 30 minuten hardlopen. Dit plan helpt je om het vol te houden en iets langer te lopen." : "Je haalt dit doel al. Dit plan helpt je om fit te blijven; kies gerust een groter doel, zoals 10 km.");
      uit.stenen.push(...(n === 3 ? ladderD(kan, PIEK.fit, 5) : [{ type: "D", lang: Math.min(kan, 60) }]));
      return uit;
    }
    if (d === "k5") {
      if (n <= 2) { uit.staart.push({ type: "R5" }); return uit; }
      uit.notities.push(n === 3 ? "Je kunt al rond de 5 km lopen. Dit plan maakt je fitter, zodat de 5 km makkelijker of sneller gaat." : "Je loopt al verder dan 5 km. Dit plan houdt je fit; kies gerust een groter doel, zoals 10 km.");
      uit.stenen.push(...(n === 3 ? ladderD(kan, PIEK.k5, 5) : [{ type: "D", lang: Math.min(kan, 60) }]));
      uit.staart.push({ type: "race", afstand: "k5" });
      return uit;
    }
    if (d === "k10") {
      if (kan < PIEK.k10) uit.stenen.push(...ladderD(kan, PIEK.k10, 5));
      else { uit.notities.push("Je loopt al lang genoeg voor 10 km. Dit plan houdt je basis op peil."); uit.stenen.push({ type: "D", lang: PIEK.k10 }); }
      uit.staart.push({ type: "D", lang: 40, taper: true }, { type: "race", afstand: "k10" });
      return uit;
    }
    if (d === "half") {
      uit.stenen.push(...ladderD(kan, PIEK.half, 10));
      uit.staart.push({ type: "D", lang: rond5(PIEK.half * 0.6), taper: true }, { type: "race", afstand: "half" });
      return uit;
    }
    // marathon
    uit.stenen.push(...ladderD(kan, PIEK.mar, 15));
    uit.staart.push({ type: "D", lang: rond5(PIEK.mar * 0.6), taper: true }, { type: "D", lang: rond5(PIEK.mar * 0.4), taper: true }, { type: "race", afstand: "mar" });
    return uit;
  }

  // Voegt herhaalweken in (gelijk verdeeld over de opbouw) tot het gewenste aantal weken.
  function rek(stenen, extra) {
    if (extra <= 0 || !stenen.length) return stenen;
    const opbouw = stenen.map((s, i) => (!s.herstel ? i : -1)).filter((i) => i >= 0);
    const aantal = new Map();
    for (let k = 0; k < extra; k++) {
      const i = opbouw[Math.floor(((k + 0.5) * opbouw.length) / extra) % opbouw.length];
      aantal.set(i, (aantal.get(i) || 0) + 1);
    }
    const uit = [];
    stenen.forEach((s, i) => {
      uit.push(s);
      for (let c = 0; c < (aantal.get(i) || 0); c++) uit.push(Object.assign({}, s, { herhaal: true }));
    });
    return uit;
  }

  const RACE = {
    k5: "Loop 5 km aan één stuk. Het mag langer dan 30 minuten duren.",
    k10: "Loop 10 km! Begin rustig, je moet nog kunnen praten.",
    half: "De halve marathon (21,1 km)! Start rustig en drink onderweg.",
    mar: "De marathon (42,2 km)! Start rustig, te snel beginnen kost je later tijd.",
  };

  // Zet één bouwsteen om naar trainingen op de gekozen dagen.
  function sessies(steen, a, weekNr) {
    const dagen = a.dagen, n = dagen.length, ervaren = a.ervaren && a.niveau >= 3;
    const eersteLang = (a.doel === "half" && !a.halveGedaan) || a.doel === "mar";
    const kop = (i, soort) => Groot(DAGNAMEN[dagen[i]]) + " · " + soort;
    const lijst = [];
    const voeg = (soort, tekst, min) => lijst.push({ kop: kop(lijst.length, soort), tekst, min });
    const herhaalTekst = steen.herhaal ? " (herhaalweek: wennen aan dezelfde belasting)" : "";

    if (steen.type === "A") {
      for (let i = 0; i < n; i++) voeg("Training", stapTekst(steen.stap) + herhaalTekst, stapMin(steen.stap) + 10);
      return lijst;
    }
    if (steen.type === "R5") {
      for (let i = 0; i < n - 1; i++) voeg("Training", stapTekst(LADDER.length - 1), 40);
      voeg("Doel", RACE.k5, 40);
      return lijst;
    }
    if (steen.type === "race") {
      const kortMin = a.doel === "mar" ? 30 : 25;
      for (let i = 0; i < n - 1; i++) voeg("Rustig", (i === 0 ? kortMin + " min rustig, met 4 × 1 min in je wedstrijdtempo" : "20 min heel rustig, of rust"), kortMin);
      const extra = eersteLang ? " Wandelpauzes mogen, bijvoorbeeld elke 2 km 1 minuut." : "";
      voeg("Doel", RACE[steen.afstand] + extra, a.doel === "mar" ? 300 : a.doel === "half" ? 150 : steen.afstand === "k5" ? 40 : 75);
      return lijst;
    }
    // Duurloopweek (D): rustige lopen + lange duurloop, eventueel één tempotraining.
    const maxRustig = a.doel === "mar" ? 60 : 45;
    let rustig = Math.min(maxRustig, Math.max(25, rond5(steen.lang * 0.5)));
    if (steen.herstel || steen.taper) rustig = Math.max(20, rond5(rustig * 0.75));
    const tempoMag = ervaren && !steen.herstel && weekNr >= 3 && n >= 3;
    const tempo = {
      k5: "10 min inlopen, 6 × 1 min wat sneller met 2 min rustig dribbelen, 10 min uitlopen",
      fit: "10 min inlopen, 6 × 1 min wat sneller met 2 min rustig dribbelen, 10 min uitlopen",
      k10: "10 min inlopen, 3 × 6 min comfortabel zwaar (praten gaat lastig) met 2 min rustig, 10 min uitlopen",
      half: "10 min inlopen, 3 × 8 min comfortabel zwaar met 2 min rustig, 10 min uitlopen",
      mar: "10 min inlopen, 2 × 15 min in je marathontempo met 3 min rustig, 10 min uitlopen",
    }[a.doel];
    const tempoKort = "10 min inlopen, 2 korte blokken in je wedstrijdtempo, 10 min uitlopen (minder, maar houd het tempo)";
    const langTekst = steen.lang + " min rustig hardlopen (je kunt nog praten)" + (eersteLang && steen.lang >= 60 ? ". Korte wandelpauzes mogen." : "");
    const soortLang = a.doel === "fit" || a.doel === "k5" ? "Langere loop" : "Lange duurloop";
    if (n === 2) {
      voeg("Rustig", rustig + " min rustig hardlopen" + herhaalTekst, rustig);
      voeg(soortLang, langTekst, steen.lang);
    } else {
      voeg("Rustig", rustig + " min rustig hardlopen" + herhaalTekst, rustig);
      if (tempoMag) voeg(steen.taper ? "Tempo (kort)" : "Tempo", steen.taper ? tempoKort : tempo, 40);
      else voeg("Rustig", rustig + " min rustig hardlopen", rustig);
      if (n >= 4) voeg("Herstel", "25 min heel rustig hardlopen", 25);
      voeg(soortLang, langTekst, steen.lang);
    }
    if (steen.herstel) lijst.forEach((t) => { t.kop = t.kop.replace(/ · /, " · Rustige week · "); });
    return lijst;
  }

  // a = { doel, niveau, ervaren, halveGedaan, dagen:[0-6], start:"JJJJ-MM-DD", eind:"JJJJ-MM-DD"|"" }
  function maakPlan(invoer) {
    const a = Object.assign({}, invoer);
    a.dagen = Array.from(new Set(a.dagen)).sort((x, y) => ((x + 6) % 7) - ((y + 6) % 7)); // maandag eerst
    const res = { weken: [], doel: DOELEN[a.doel].kort, notities: [], waarschuwingen: [], blok: null, start: a.start };
    if (a.niveau <= 2 && a.dagen.length > 3) {
      res.notities.push("Je koos " + a.dagen.length + " dagen. Voor beginners is 3 keer per week genoeg, met een rustdag ertussen. Het plan gebruikt de eerste 3 dagen.");
      a.dagen = a.dagen.slice(0, 3);
    }
    if (a.doel === "mar" && a.dagen.length < 3) res.waarschuwingen.push("Voor een marathon is 3 of 4 keer per week trainen aan te raden. Met 2 keer per week haal je de ongeveer 30 km per week niet.");
    const b = bouwstenen(a);
    if (b.blok) { res.blok = b.blok; return res; }
    res.notities.push(...b.notities);
    let stenen = b.stenen;
    const basis = stenen.length + b.staart.length;
    const minimaal = Math.max(basis, a.niveau >= 3 ? MIN_WEKEN[a.doel] || 0 : 0);
    let doelWeken = minimaal;
    if (a.eind) {
      const beschikbaar = Math.floor((dagNr(a.eind) - dagNr(a.start)) / 7) + 1;
      if (beschikbaar < basis) {
        res.waarschuwingen.push("Tot je doeldatum heb je " + beschikbaar + " weken. Om veilig op te bouwen heb je er minstens " + basis + " nodig. Het plan duurt daarom " + basis + " weken. Kies een latere datum of eerst een kleiner doel.");
        doelWeken = basis;
      } else {
        const max = Math.ceil(minimaal * 1.5);
        doelWeken = Math.min(beschikbaar, max);
        if (beschikbaar > max) {
          // Laat het plan zo beginnen dat de laatste week op de doeldatum uitkomt.
          res.start = plusDagen(a.eind, -7 * (doelWeken - 1) - ((dagNr(a.eind) - dagNr(a.start)) % 7));
          res.notities.push("Je hebt ruim de tijd. Een langer plan is niet nodig, dus je plan begint op " + new Date(res.start + "T12:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long" }) + ".");
        }
      }
    }
    stenen = rek(stenen, doelWeken - basis);
    const alle = stenen.concat(b.staart);
    res.weken = alle.map((s, i) => sessies(s, a, i + 1));
    // Weekafstand voor de marathon (ruwe schatting: 6,5 min per km).
    if (a.doel === "mar") {
      const piekMin = Math.max(...res.weken.map((w) => w.reduce((t, x) => t + (x.min || 0), 0)));
      res.notities.push("In de zwaarste week loop je ongeveer " + Math.round(piekMin / 6.5) + " km. Voor een marathon is ongeveer 30 km per week of meer aan te raden.");
    }
    if (a.doel === "half" || a.doel === "mar") res.notities.push("De laatste weken train je minder (afbouwen), zodat je fit aan de start staat.");
    return res;
  }

  return { maakPlan, NIVEAUS, DOELEN, DAGNAMEN };
})();
if (typeof module !== "undefined") module.exports = TCPlan;
