---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Informatik, Sekundarstufe I, Klasse 9-10 (Lernende der 9. Klasse). Orientierung: Lernlandkarte Informatik von
  lernapps.net (<https://lernapps.net/apps/map/informatik/>), Strand `informatik/daten`, beruhend auf den
  GI-Bildungsstandards Informatik Sek I (2025), Inhaltsbereich „Information und Daten“
  (<https://www.mnu.de/images/fachbereiche/Informatik/Bildungsstandards_Sek_I_2025__pdf-A_.pdf>).
- Teil des Epics Informatik (lernapps/apps#509), Auftrag lernapps/apps#494. Abgrenzung: Tabellen speichern und abfragen
  (SQL) ist #498, Variablen #495.

## Competencies

Kapitel `werte` (Zahlen, Texte, Wahrheitswerte):
- Recap `informatik/daten-interpretieren`: `src/werte/das-brauchst-du.yaml`.
- `datentypen` „Ich kann die Datentypen ganze Zahl, Kommazahl, Text und Wahrheitswert unterscheiden und für eine
  Angabe den passenden Datentyp wählen.“ `src/werte/datentypen.yaml`.
- `rechnen-und-vergleichen` „Ich kann mit Daten rechnen und Werte vergleichen, zum Beispiel mit +, -, *, /, < und =.“
  `src/werte/rechnen-und-vergleichen.yaml`.
- `logische-verknuepfungen` „Ich kann Bedingungen mit und, oder und nicht verknüpfen und den Wahrheitswert des
  Ergebnisses bestimmen.“ `src/werte/logische-verknuepfungen.yaml`.

Kapitel `formeln` (Formeln und Bezüge):
- `tabellenkalkulation-formeln` „Ich kann Formeln mit Zellbezügen schreiben, damit Ergebnisse automatisch neu berechnet
  werden.“ `src/formeln/formeln.yaml`.
- `relative-und-absolute-bezuege` „Ich kann relative und absolute Zellbezüge unterscheiden und beim Kopieren einer
  Formel richtig einsetzen.“ `src/formeln/bezuege.yaml` (Musterseite).

Kapitel `funktionen` (Funktionen verschachteln und Datenflüsse zeichnen):
- `datenflussdiagramm` „Ich kann darstellen, wie Daten durch Funktionen fließen, und dazu ein Datenflussdiagramm
  zeichnen.“ `src/funktionen/datenflussdiagramm.yaml`.
- `funktionen-verketten` „Ich kann vordefinierte Funktionen, auch die WENN-Funktion, nutzen und mehrere Funktionen
  verschachteln.“ `src/funktionen/funktionen-verschachteln.yaml`.

Die Übungs-ids stehen in jeder Seite unter Abschnitt `uebung`; die Selbsteinschätzung je Kapitel in `chapter.yaml`.

## Content structure

- Jede Seite hat die Abschnitte `einstieg` (Chat der 9b und eine erste, leichte Aufgabe), `idee` (Erklärung mit
  Rechenblatt oder Diagramm) und `uebung` (mindestens drei Übungen, leicht → schwer). Titel sagen, was der Abschnitt
  tut.
- Höchstens 350 Wörter Lesetext, höchstens vier Textblöcke hintereinander.
- Jede Seite außer dem Recap hat eine Frage oder ein `generated` und insgesamt mindestens vier Übungen (eine
  `FormelAufgabe` zählt mit).
- Geschichte: Die Klasse 9b (alle 14) macht die Kasse des Schulfests. Selin baut das Rechenblatt, Jona zählt, Mia prüft
  nach, Ben, Ali, Lea und Tom verkaufen, die Klassenlehrerin Frau Berg gibt das Ziel vor: 300 € für die Klassenfahrt,
  davon gehen 10 % an die Schülervertretung. Chat als `text`-Block: Zeilen „**Selin:** …“, zwischen den Zeilen eine
  Leerzeile. Jede Seite endet mit dem nächsten Schritt der Kasse.

## Terminology

- Deutsch in einfacher Sprache, „du“. Englisch plain English, „you“.
- Begriffe (de | en): Rechenblatt | spreadsheet (kein Produktname; „Tabellenkalkulation“ als Oberbegriff) · Zelle | cell ·
  Zellbezug | cell reference · relativer, absoluter, gemischter Bezug | relative, absolute, mixed reference · Formel |
  formula · Funktion | function · Argument | argument · Rechenoperator | arithmetic operator · Vergleichsoperator |
  comparison operator · logische Verknüpfung | logical operator · Bedingung | condition · Datentyp | data type · ganze
  Zahl | whole number (integer) · Kommazahl | decimal number (real) · Text | text (string) · Wahrheitswert | Boolean
  value · WAHR/FALSCH | TRUE/FALSE · verschachteln | nest · Datenflussdiagramm | data flow diagram · Fehlerwert | error
  value.
- „verschachteln“, nie „verketten“: VERKETTEN ist in deutschen Programmen eine Textfunktion.
- Formeln: Deutsch mit deutschen Funktionsnamen, `;` und Dezimalkomma (`=WENN(D6>=300;"Ziel";"weiter")`); Englisch
  mit englischen Namen, `,` und Punkt (`=IF(D6>=300,"goal","not yet")`). In Props stehen Formeln immer englisch; die
  Komponenten übertragen sie (`uebertrage` in `Formel.ts`).
- Fehlerwerte als Beispiele aus verbreiteten Programmen: #WERT!/#VALUE!, #DIV/0!, #NAME?, #BEZUG!/#REF!. Übungen prüfen
  die Fehlerart, nie die Schreibweise.
- Unser Blatt wandelt Text nie in eine Zahl um ("3"+2 ergibt #WERT!) und rechnet nicht mit WAHR. Die Seite
  `rechnen-und-vergleichen` sagt: Die meisten Tabellenkalkulationen wandeln Text, der wie eine Zahl aussieht, still in
  eine Zahl um ("3"+2 ergibt dort 5); „Hallo“+2 ergibt auch dort #WERT!. Unser Blatt wandelt bewusst nicht um, damit der
  Typ sichtbar bleibt.
- Glossar (`definition`-Blöcke) beim ersten Auftreten: Datentyp, Wahrheitswert, Operator, Bedingung, Formel, Zellbezug,
  absoluter Bezug, Funktion, Datenflussdiagramm.

## Exercise patterns

- **Typ wählen** (datentypen): `generated` mit `pick: 1` aus `src/data/angaben.yaml` (Felder `angabe`, `typ`,
  `warum`), `compare: { choice: [...] }` mit den vier Typen. Beispiel `werte/datentypen#typ-waehlen`.
- **Rechnen** (rechnen-und-vergleichen): `generated` mit gezogenen Preisen und Anzahlen; Fehler „Punkt vor Strich
  vergessen“. Vergleich als `generated` mit `compare: { choice: [WAHR, FALSCH] }`.
- **Bedingungen verknüpfen** (logische-verknuepfungen): `generated` mit zwei Bedingungen, Fehler „ODER als
  entweder-oder“, „NICHT übersehen“; Wahrheitstafel als `table`.
- **Formel schreiben** (formeln, bezuege, funktionen-verschachteln): Komponente `FormelAufgabe` mit `aufgaben` in den
  Props: gezeigtes Blatt, Zielzellen, Musterformel (englisch) und Testblätter mit anderen Zahlen. `check` rechnet die
  Formel der Lernenden in allen Blättern und, beim Kopieren, in allen Zielzellen und vergleicht die Werte mit der
  Musterformel. Beispiel `formeln/bezuege#anteil-formel`.
- **Kopierte Formel lesen** (bezuege): `generated` mit Zeilenversatz, Antwort als Auswahl von Formeln.
- **Datenfluss lesen** (datenflussdiagramm): `multiple-choice` (welche Zellen ändern sich), `ordering`
  (Rechenreihenfolge), `matching` (Formel ↔ Pfeile) am Diagramm.

## Figures

- `Rechenblatt` (Anzeige): Zellen nach Typ gefärbt, immer mit Symbol und Wort im Namen der Zelle: Zahl „#“ (blau
  #2f5fb3), Text „Abc“ (grau-violett), Wahrheitswert „✓/✗“ (grün #23704a), Fehler „!“ (rot). Die Farben mit Text in
  ausreichendem Kontrast, hell und dunkel.
- Pfeile beim Kopieren: orange #a4500f von der Formelzelle zu jeder Zelle, auf die ein Bezug zeigt; ein $-Bezug hat
  einen Pfeil mit Schloss-Zeichen „$“.
- `Datenfluss` (Anzeige): ein Kasten je Zelle, Pfeil von der Quelle zum Ziel; eine Zelle kann zu Kästen je Operation
  aufgeklappt sein. Texte als Props.
- Bild `src/images/kassenstand-9b.svg`: selbst gezeichnet, ohne Text, CC BY 4.0, als `labelled-figure`.
- Alt-Texte nennen, was zu sehen ist, nie die Lösung einer Aufgabe.

## Sources

- Lernlandkarte Informatik (lernapps.net), GI-Bildungsstandards Sek I 2025 (PDF oben).
- Verhalten gängiger Tabellenkalkulationen ("3"+2 = 5, Fehlerwerte) nach dem fachlichen Prüfer; keine Screenshots
  fremder Software, keine Produktnamen im Vordergrund.

## Adding a chapter or round

1. Kompetenz aus der Karte wählen, `requires` prüfen; Ordner `src/<kapitel>/` mit `chapter.yaml`, in `src/app.yaml`
   unter `chapters` eintragen.
2. Je Kompetenz eine Seite mit `einstieg`, `idee`, `uebung`; Chat der 9b weiterführen.
3. Rechenblätter als `vue-component` `Rechenblatt` mit `zellen` (Formeln englisch) und `nojs`-Tabelle.
4. Übungen aus den Mustern oben; Formeln mit `FormelAufgabe` und Testblättern.
5. `npx vp build`, `npx --no -- lernapps check`, Ansicht bei 360 und 1280 px, Selbsteinschätzung ergänzen, Commit.

## Rules learned from mistakes

None yet.
