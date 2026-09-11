# Motion Ticker, eigen kopie voor ISW Hoogland

Kopie van [jeroenvantilburg/motionticker](https://github.com/jeroenvantilburg/motionticker), MIT-licentie, commit 9cf1374 van 22 april 2026. Auteurschap en licentie zijn ongewijzigd; het `LICENSE`-bestand zit erbij.

Reden voor een eigen kopie: de originele app staat op iemand anders zijn site en kan updaten op een moment dat jij een practicum draait. Een eigen kopie verandert alleen als jij hem verandert.

## Wat is er gewijzigd

### 1. Handmatig tikken, `scripts/motionticker.js`

De originele code liet een datapunt vervallen zodra de muisaanwijzer ook maar één pixel bewoog tussen indrukken en loslaten:

```js
canvas.on('mouse:move', () => {
  if( analysisStarted && !automaticAnalysis && mouseIsDown) mouseIsDown = false;
});
```

Dat is er in april 2021 in gezet om touch-scrollen op tablets mogelijk te houden. Op een trackpad drift de cursor tijdens een tik bijna altijd een pixel of twee, en dan wordt er stil niets toegevoegd.

Nu wordt de positie bij het indrukken onthouden en vervalt het punt alleen als de aanwijzer verder dan 10 pixels beweegt. Scrollen op een tablet blijft werken, tikken op een trackpad wordt betrouwbaar. De drempel staat in één constante, `dragThresholdPx`, als je hem wilt bijstellen.

### 2. Service worker, `sw.js`

De originele service worker was cache-first met een vaste cachenaam en zonder opruimstap. Wie een oudere versie in de cache had, kon een mengeling van oude en nieuwe bestanden geserveerd krijgen. Dat is de klassieke reden waarom zo'n app van de ene dag op de andere stukgaat.

Nu network-first met terugval op de cache, oude caches worden bij activatie verwijderd, en de bestanden worden stuk voor stuk gecachet zodat één geblokkeerd bestand niet de hele installatie laat mislukken.

Wil je helemaal geen offline gebruik en dus ook geen cache, haal dan in `index.html` de regel met `scripts/registerSW.js` weg.

### 3. `index.html`

De verwijzing naar `scripts/motionticker.js?v2` is `?isw1` geworden, zodat browsers de gewijzigde versie zeker ophalen.

### 4. Geen externe bestanden meer

De app haalde vijf dingen van cdnjs.cloudflare.com: jQuery 3.5.1, Chart.js 2.9.4, Papa Parse 5.3.0, Fabric 4.3.1 en Font Awesome 4.7.0. Blokkeert het schoolnetwerk cdnjs, dan laadt Fabric niet en reageert het canvas nergens meer op. Dat geeft precies het beeld "er gebeurt niets als ik klik".

Die vijf staan nu in de map zelf, in `scripts/`, `css/` en `fonts/`, in exact dezelfde versies, opgehaald uit de officiële repositories op GitHub. `index.html` en `sw.js` wijzen ernaar. De app heeft nu geen enkele externe verbinding meer nodig.

## Hosten

Het is een verzameling statische bestanden, er is geen server nodig.

1. Fork `jeroenvantilburg/motionticker` op GitHub, of maak een nieuwe repository en zet deze map erin.
2. Settings, Pages, Source op de `main`-branch, map `/ (root)`.
3. Je krijgt een adres van de vorm `https://<jouwnaam>.github.io/motionticker/`. Dat adres zet je in de werkbladen in plaats van `jeroenvantilburg.nl/motionticker`.

Lokaal testen kan ook, met `python3 -m http.server` in deze map. Openen via `file://` werkt niet, want de service worker en de wasm-bestanden vereisen http.

## Hoe de klikpatch is getest

Nadat de bibliotheken lokaal stonden kon de app in een headless browser draaien. Met een testvideo, schaal ingesteld, automatic uit en de analyse gestart, één keer klikken:

| Versie | stil klikken | 3 px verschuiving | 30 px verschuiving |
|---|---|---|---|
| origineel | punt toegevoegd | **geen punt** | geen punt |
| deze versie | punt toegevoegd | punt toegevoegd | geen punt |

De middelste kolom is de bug. Drie pixels drift is wat een trackpad tijdens een tik doet. De rechterkolom laat zien dat een echte sleepbeweging nog steeds genegeerd wordt, dus scrollen op een tablet blijft werken.

Dit is getest in Chromium op Linux, niet op een chromebook. Draai hem dus nog één keer zelf voordat je hem voor de klas gebruikt.

## Nog te controleren in de klas

Deze drie kunnen hetzelfde beeld geven zonder dat er iets stuk is:

- De knop moet na het klikken op Start analysis "Stop analysis" heten. Staat hij nog op Start, dan is de analyse niet begonnen en doet tikken niets.
- Het vinkje "automatic" moet uit staan. Met automatic aan negeert de code elke handmatige klik.
- Staat er een `#` met tekst achter het webadres? De aprilversie verbergt bij `#gl2` de x- en y-componenten in alle grafieken.
