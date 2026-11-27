---
# Read by the hooks, the review, the evals. Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json
# Written by `lernapps plan` and the hooks. Never change a key or a value by hand.
# Archetype, null until chosen in Explore. Allowed values: explainer, interactive, quiz.
archetype: explainer
# Current phase. Allowed values: explore, plan, code, commit.
phase: code
# prePushFailures: failed pre-push runs, written by the hook.
prePushFailures: 0
# failedChecks: failed rules and runs, written by lernapps check and the hooks.
failedChecks: { accessible: 2, checks-pass: 4, usable-at-360px: 1 }
---

# Plan: informatik-tabellen, first version

<!--
For you, the assistant. The process is in AGENTS.md; this plan holds the method.
- `npx --no -- lernapps plan next` prints the task to do now, `plan done` ticks it and prints the next one.
- You write only below Goal, Key decisions, Notes, Answers, Entry draft, Content method and Retrospective, in the
  creator's language. Delete the comment of a section once the section is filled.
- Work on the branch `work`, locally: push nothing before Commit.
-->

*Started 2026-11-27. Explore, Plan, Code, Commit.*

## Goal

Jugendliche der 9. Klasse bauen mit der Klasse 9b ein wachsendes Rechenblatt für die Kasse des Schulfests: erst Werte mit
Datentypen, dann Operatoren, Formeln mit Bezügen, kopierte Formeln, Funktionen und ein Datenflussdiagramm. Sie lernen,
Formeln zu schreiben, die auch mit anderen Zahlen stimmen.


## Key decisions

- Archetyp `explainer` mit Komponenten: Seiten mit Übungen; ein Rechenblatt, eine Formel-Übung und ein Datenflussdiagramm kann kein Block zeigen oder prüfen.
- Auftraggeber ist der Orchestrator des Epics lernapps/apps#509 (Auftrag lernapps/apps#494); seine Antworten stehen unter „Answers“.
- Sprachen de und en, je vollständig.
- Drei Typfarben (Zahl, Text, Wahrheitswert) mit Symbol; ganze Zahl und Kommazahl als Unterarten von Zahl, Übungen fragen alle vier Typen ab (Orchestrator).
- Unser Blatt wandelt Text nie in eine Zahl um: "3"+2 ergibt #WERT!; die Seite sagt, dass die meisten Tabellenkalkulationen das still umwandeln (Orchestrator).
- „verschachteln“ statt „verketten“ im Text (VERKETTEN ist eine Textfunktion); Karten-id bleibt (Orchestrator gibt es an die Karte weiter).
- Datenflussdiagramm: erst Kasten je Zelle, auf der letzten Seite klappt eine Zelle zu Kästen je Operation auf; beide Sichten zeigen denselben Fluss (Orchestrator).
- Wahrheitstafel als `table`-Block (Orchestrator).
- Übungen prüfen die Fehlerart, nicht die Schreibweise des Fehlerwerts (Orchestrator).
- Formeln werden über Testblätter mit verdeckten Werten geprüft, nie per Textvergleich.
- Musterseite: `formeln/bezuege` (Orchestrator).


## Notes

Strand `informatik/daten` (Lernlandkarte Informatik, GI-Bildungsstandards Sek I 2025).

Kapitel und Kompetenzen:
1. `werte` Zahlen, Texte, Wahrheitswerte: Recap `informatik/daten-interpretieren` (geübt in informatik-daten-codieren,
   Seite information/deuten), `datentypen`, `rechnen-und-vergleichen`, `logische-verknuepfungen`.
2. `formeln` Formeln und Bezüge: `tabellenkalkulation-formeln`, `relative-und-absolute-bezuege`.
3. `funktionen` Funktionen verschachteln und Datenflüsse zeichnen: `datenflussdiagramm`, `funktionen-verketten`.

Seiten (Voraussetzung außerhalb der App nur im Recap):
- `werte/das-brauchst-du` (recap daten-interpretieren) · `werte/datentypen` (datentypen) · `werte/rechnen-und-vergleichen`
  (rechnen-und-vergleichen) · `werte/logische-verknuepfungen` (logische-verknuepfungen)
- `formeln/formeln` (tabellenkalkulation-formeln) · `formeln/bezuege` (relative-und-absolute-bezuege)
- `funktionen/datenflussdiagramm` (datenflussdiagramm) · `funktionen/funktionen-verschachteln` (funktionen-verketten)

Wie Lernende hinkommen und welche Fehlvorstellung die Rückmeldung fängt (Fachprüfer):
- datentypen: Typ aus der Bedeutung wählen (Anzahl ganze Zahl, Preis Kommazahl, Postleitzahl Text). Fängt: "123" als Text = Zahl; Format ändert den Wert; WAHR sei Text.
- rechnen-und-vergleichen: Formeln ausprobieren, Ergebnistyp ablesen. Fängt: Punkt vor Strich vergessen; Vergleich liefere Zahl; Text+Zahl.
- logische-verknuepfungen: Wahrheitstafel aus Beispielen füllen. Fängt: ODER als entweder-oder; UND schon bei einem WAHR; NICHT übersehen.
- tabellenkalkulation-formeln: Wert ändern, Formel rechnet neu. Fängt: Zahlen fest eintippen statt Bezug; falsche Zelle.
- relative-und-absolute-bezuege: Kopieren, Pfeile wandern, $ hält fest. Fängt: alles bleibe gleich; $ heiße Geld; welcher Teil von A$1 fest ist.
- datenflussdiagramm: Pfeile von Quelle zu Ziel aus Formeln lesen. Fängt: Pfeil als Zeitfolge; Richtung verwechselt.
- funktionen-verketten: von innen nach außen auswerten. Fängt: innere Funktion nicht zuerst; MITTELWERT zähle leere Zellen.

Kernbegriffe (de | en): Zelle | cell · Zellbezug | cell reference · relativer/absoluter/gemischter Bezug |
relative/absolute/mixed reference · Formel | formula · Funktion | function · Argument | argument · Rechen-/Vergleichsoperator |
arithmetic/comparison operator · logische Verknüpfung | logical operator · Ausdruck | expression · Bedingung | condition ·
Datentyp: ganze Zahl, Kommazahl, Text, Wahrheitswert | data type: whole number (integer), decimal number (real), text
(string), Boolean · WAHR/FALSCH | TRUE/FALSE · verschachteln | nest · Datenflussdiagramm | data flow diagram · Fehlerwert | error value.

Umfang: Rechnen in Tabellen. Nicht hier: Speichern und Abfragen (SQL, #498), Variablen (#495), Diagramme, Formatieren,
Sortieren. Funktionen: SUMME, WENN, UND, ODER, NICHT, MITTELWERT, MIN, MAX. Sprachen de und en.

Quellen: Lernlandkarte https://lernapps.net/apps/map/informatik/ ; GI-Bildungsstandards Sek I 2025
https://www.mnu.de/images/fachbereiche/Informatik/Bildungsstandards_Sek_I_2025__pdf-A_.pdf ; Verhalten "3"+2 = 5 in
gängigen Programmen nach Fachprüfer (ungeprüft gegen Hersteller-Hilfe).


## Explore

<!--
- Find out what the app teaches, for whom, how much and how it looks. Ask; write no code, run no `create`.
- An answer counts only in the creator's words under "Answers". At most 2 questions per message, one topic each.
-->

### Tasks

- [x] Check the start: the folder `.agents/skills/lernapps-app` exists (else stop and tell the creator that the folder
      was not started with `init`), and `git branch --show-current` prints `work` (else `git switch -c work`).
- [x] Load skill `lernapps-app`. Tell the creator in two sentences what a lernapps app is and where it will live: at
      their own address, free and public, and once listed as a copy on lernapps.net. Say that the technical part
      (GitHub) comes at the end and that you do it.
- [x] Interview: ask the topics "Goal" and "Learners" of "Answers".
- [x] Load skill `lernapps-map-assignment` and read the learning map of the subject as it says. The creator brings
      the content themselves (material, a word list, the pages): note under "Notes" which competencies of the map it
      covers. Else write the skill's assignment, with its story; the creator's yes answers the topics Content and
      Amount. A subject without a map: skip this task and say so.
- [x] Load skill `lernapps-exercise-patterns` and read its reference for the subject. Note under "Notes" how learners
      will practise what the goal names.
- [x] Choose the archetype as skill `lernapps-app` says: read the README of each archetype in question, then tell the
      creator in plain words what the chosen one can and cannot do. Write the archetype and its reason under "Key
      decisions".
- [x] Run `npx --no -- lernapps skills --archetype <name>` with the chosen archetype. It installs the archetype's
      skills and adds the archetype's tasks to this plan.
- [x] Load skill `lernapps-explainer-design`. An explainer has the look of the runtime: write "fixed by the
      archetype" under the topic "Look and feel" of "Answers".
- [x] Interview: ask every other topic of "Answers", in order. Leave out only a topic that an answer of the creator
      already covers, and note which answer. A topic nobody answered is asked once before you write an assumption
      with "(guess)".
- [x] Load skill `lernapps-content-research` and research as it says. Write under "Notes": the strand or subject, the
      competencies by chapter with their ids, the sources you opened.
- [x] Write under "Notes" which competency goes on which page and which pages form a chapter, as "Map the content" of
      skill `lernapps-explainer-design` says. Per page, name the prerequisites the app does not practise.
- [x] Write under "Notes", one line per competency: how learners get there (they derive it, they do not only read it
      off), and which misconception the feedback catches.
- [x] Write under "Notes" the scope: what is in, what is out and why, the data range (for example "all main-group
      elements", never a silent "1–20"), the languages.
- [x] **Checkpoint:** research. Show in plain words: the strand or why none, the competencies by chapter, the didactic
      approach, the scope, every "(guess)", the sources and what is unchecked, the archetype and its reason. Stop and
      wait. Changes: change them, then ask again.
      Creator: Orchestrator zu Recherche #494 – weiter zum Plan: Ja: drei Farben + Symbol; Budget je Komponente; Text+Zahl mit genauer Begründung; table-Block statt SVG.

### Answers

<!-- The interview: per topic the creator's answer, in their words. Keep the topics. -->

- Goal: Orchestrator (#494): „Ein wachsendes Rechenblatt für eine wiederkehrende Aufgabe (die Kasse des Schulfests): erst Werte mit Typen, dann Formeln, dann kopierte Formeln mit Bezügen, am Ende verkettete Funktionen.“
- Learners: „Klasse 9b, alle 14“, Informatik 9-10; Vorwissen aus den Apps der Wellen 1–2.
- Model and focus: Nachbar-Apps des Epics (informatik-automaten: Simulator, Chat). Schwerpunkt Rechenblatt und Formel-Übungen mit verdeckten Werten (Orchestrator).
- Hurdles: „Die Jugendlichen probieren, was passiert, wenn man Text und Zahl addiert oder zwei Bedingungen mit UND verknüpft.“ Weitere vom Fachprüfer, siehe Notes.
- Content: aus dem Auftrag und den Quellen, von mir geschrieben.
- Amount: „Baue alle drei Kapitel.“
- Languages: „Jede App in Deutsch und Englisch.“
- Look and feel: fixed by the archetype. Geschichte als Klassenchat (Nachtrag 4).
- Terms: „Rechenblatt“, „Tabellenkalkulation“ (kein Produktname), Kernbegriffe siehe Notes; „verschachteln“ statt „verketten“.
- Finding the app: (guess) Tabellenkalkulation, Formeln, Zellbezüge, absoluter Bezug, WENN-Funktion, Datentypen, Informatik Klasse 9.

## Plan

<!--
- Map the confirmed content onto the archetype. No new content questions: a gap in the content goes back to Explore.
- The creator confirms the plan in one read. After the yes you work on your own.
-->

### Tasks

- [x] Map the content as "Map the content" of skill `lernapps-explainer-design` says, and write the result under
      "Content method".
- [x] Choose a pattern per competency as skill `lernapps-exercise-patterns` says, and add it to "Content method".
- [x] Add to "Content method" one line per page, as "Engagement" of skill `lernapps-explainer-design` says: the
      opening task, the change of activity, the reward, the story.
- [x] Add the tasks of Code, each one a piece of work that ends in a commit. First the pattern: one complete page or
      screen, `npx --no -- lernapps plan add --at pattern "<task>"`. Then the others, one call each:
      `npx --no -- lernapps plan add --at pages "<task>"`. Each task says what it builds and what it shows.
- [x] Draw a sketch of each screen, component or interactive exercise: a static SVG or image, or the steps with what
      learners see after each. Keep the files in `.vibe/sketches/`.
- [x] Show the creator, short: goal, competencies by chapter, the Code tasks, the sketches, and the content method in
      plain words (what learners see and do, what the app cannot do). At most 2 questions.
- [x] **Checkpoint:** confirm the plan and the content method. Stop and wait for an explicit yes. Changes: change
      them, then ask again.
      Creator: Orchestrator zum Plan #494: Ja, der Plan steht. Zelle und Operation verbindest du, wie du vorschlägst. Musterseite: bezuege (Kap. 2).

### Content method

Abschnitte auf jeder Seite: `einstieg` (Chat + erste leichte Aufgabe), `idee` (Erklärung mit Rechenblatt/Diagramm),
`uebung` (Übungen leicht → schwer). Jede Seite außer dem Recap hat mindestens eine Frage oder `generated` und insgesamt
mindestens vier Übungen.

Geschichte: Die 9b (alle 14) macht die Kasse des Schulfests. Selin baut das Rechenblatt, Jona zählt, Mia prüft,
Ben/Ali/Lea/Tom verkaufen, Frau Berg gibt das Ziel (300 € für die Klassenfahrt) vor. Jede Seite beginnt mit Chat-Zeilen
(**Name:** …, Leerzeile dazwischen), endet mit dem nächsten Schritt.

Pro Seite (Einstieg · Wechsel · Belohnung · Geschichte):
- `das-brauchst-du`: Was heißt „3“ auf Bens Zettel? · Lesen, eine Frage · Daten deuten können · Selin sammelt die Zettel.
- `datentypen`: Welcher Typ ist „2,50“? · Rechenblatt ansehen, Typen zuordnen, Postleitzahl-Falle · Kasse mit richtigen Typen · Selin tippt die Kasse ab.
- `rechnen-und-vergleichen`: Was ergibt =2+3*4? · ausprobieren, rechnen, vergleichen · eigene Formel mit Wahrheitswert · Mia: „Waffel+2 geht nicht?“
- `logische-verknuepfungen`: Ist der Stand offen? (zwei Bedingungen) · Wahrheitstafel lesen, Bedingungen verknüpfen · UND/ODER sicher · Frau Bergs Regel für Rabatt.
- `formeln`: Was passiert mit dem Umsatz, wenn Jona sich verzählt hat? · Wert ändern, Formel schreiben · Formel, die immer stimmt · Jona zählt neu.
- `bezuege` (Muster): Kopiert man =B2*C2 nach unten, was steht in D3? · Pfeile ansehen, $ setzen, kopieren · Formel für alle Zeilen · Anteil für die Klassenfahrt.
- `datenflussdiagramm`: Welche Zellen ändern sich, wenn der Waffelpreis steigt? · Diagramm lesen, Pfeile zuordnen · Fluss der ganzen Kasse · Mia sucht einen Fehler.
- `funktionen-verschachteln`: Ist das Ziel erreicht? · im Diagramm von innen nach außen, dann im Blatt · fertige Kasse mit WENN(SUMME…) · Rückblick, Schulfest vorbei.

Muster je Kompetenz: Typzuordnung per `generated` aus Datendatei `angaben` (Angabe → einer von vier Typen) und `matching`;
Rechnen per `generated` mit Fehlern (Punkt vor Strich); Logik per `generated` (zwei Bedingungen, WAHR/FALSCH) und `table`;
Formeln und Bezüge per `FormelAufgabe` und `single-choice`; Kopieren per `generated` (Formel nach dem Kopieren);
Datenfluss per `multiple-choice`/`ordering`/`matching` am Diagramm; Funktionen per `FormelAufgabe` und `generated`.

Komponenten (je ≤ 20 kB gzip mit `Formel.ts`; ein Block kann kein lebendes Blatt zeigen und keine Formel über Testblätter prüfen):
- `Formel.ts`: Parser und Auswerter ohne eval (Bezüge, Bereiche, Operatoren, Funktionen de/en, Kopieren, Fehlergründe).
- `Rechenblatt` (Anzeige): Gitter mit Typfarbe + Symbol; Zelle wählen und Formel bearbeiten; Kopieren mit Pfeilen.
  Lernaktion: Lernende ändern Werte und sehen, was neu rechnet. Kann nicht: speichern, formatieren. nojs: Tabelle mit Formeln und Werten.
- `FormelAufgabe` (Übung): Blatt mit leerer Zielzelle; Lernende tippen eine Formel. `check` rechnet sie im gezeigten Blatt
  und in verdeckten Testblättern (andere Zahlen) und, bei Kopier-Aufgaben, in allen Zielzellen; `reason` nennt Lesefehler,
  Fehlerwert, „feste Zahl statt Bezug“, „Bezug wandert beim Kopieren“. Kann nicht: Schreibweise bewerten.
- `Datenfluss` (Anzeige): SVG, Kasten je Zelle, Pfeil Quelle → Ziel aus denselben Formeln; optional eine Zelle aufgeklappt zu Kästen je Operation.
  nojs: Liste der Pfeile.

Daten: `src/data/angaben.yaml` (Angabe, Typ). Bild: `src/images/kassenstand-9b.svg` ohne Text, als `labelled-figure`.
Neues Kapitel: Seite mit drei Abschnitten, Chat, Rechenblatt-Props aus Zellenliste (`zellen: [{ z: "B2", w: … }]`, Formeln englisch, die Komponente überträgt).

## Code

<!--
- Build the app, locally on `work`, on your own. After each task: `plan done`, then one commit with the work and this
  plan. The hooks check each commit; a failing check is fixed from its message, as skill `lernapps-cli` says.
- What you cannot decide: choose, write it under "Key decisions" with "(guess)", go on.
- The creator asks for a change: say your reading in one sentence first, then change every place it holds for
  (`feedback-applied-everywhere`).
-->

### Tasks

- [x] Load skill `lernapps-cli`. Create the app as its section "Create" says:
      `npx --no -- lernapps create --archetype explainer`.
- [x] Fill the content guide `.agents/skills/app-content/SKILL.md` from "Notes" and "Content method": every heading,
      no "FILL IN" left. Commit it before any content.
- [x] Load skill `lernapps-explainer`.
- [ ] Load skill `lernapps-content-questions`. Read whole, with your file tool:
      `.agents/skills/lernapps-explainer/references/blocks.md` and
      `.agents/skills/lernapps-explainer/references/exercises.md`. A foreign language: also
      `references/language-tasks.md` in the same folder. A component in the plan: also `references/components.md`.
- [ ] Decide whether the app needs `scope`, as "`scope`" in
      `.agents/skills/lernapps-explainer/references/structure.md` says. Write the choice under "Key decisions".
- [ ] Musterseite formeln/bezuege in de und en: Formel.ts, Rechenblatt mit Kopier-Pfeilen, FormelAufgabe mit verdeckten Testblättern, Chat, Übungen; Größe der Komponenten messen
<!-- tasks: pattern (1 added): the one page or screen that is the pattern for the others -->
- [ ] **Checkpoint:** the pattern page. Load skill `lernapps-learner-check` and do its learner check on the page. Fix
      what it finds. Then show the creator the page and ask whether the others may follow it. Stop and wait. A
      change: change the pattern first.
- [ ] Kapitel werte: Recap das-brauchst-du, datentypen (Datendatei angaben), rechnen-und-vergleichen, logische-verknuepfungen mit Wahrheitstafel; Bild kassenstand-9b
- [ ] Seite formeln/formeln: Zellbezüge und Neuberechnung, FormelAufgabe Umsatz
- [ ] Kapitel funktionen: Komponente Datenfluss, Seiten datenflussdiagramm und funktionen-verschachteln (aufgeklappte Zelle)
- [ ] Selbsteinschätzung, Glossar, Text ohne JS und Ansicht aller Seiten bei 360 und 1280 px prüfen
<!-- tasks: pages (4 added): the other pages or screens, after the pattern -->
- [ ] Update the content guide so that it describes the app as built (`app-content-matches`).
- [ ] Run `npx --no -- lernapps check` until it passes.
- [ ] Look at every screen and state, at 360 px and on a desktop, as "Look at the app" of skill `lernapps-cli` says.
      Compare each with its sketch.
- [ ] Do the whole-app check of skill `lernapps-learner-check`. Fix what it finds and write under "Notes" what you
      fixed.

## Commit

<!--
- Put the app on GitHub, publish it with the creator's yes, then list it. A push to `main` publishes.
- Open the pull requests (to `main`, to the catalog) without asking: they publish nothing.
- The creator asked to stop before publishing (a trial): stop here and say so.
-->

### Tasks

- [ ] Load skill `lernapps-explainer-self-assessment`. Add the self-assessment as it says, or write under "Key
      decisions" why the app has none. Commit.
- [ ] Load skill `lernapps-github`. Set up the repository and Pages as it says. Ask for the repository's name and
      every click only the creator can make, in one message.
- [ ] Push `work`, open the preview pull request and see its checks to green, as skill `lernapps-github` says.
- [ ] **Checkpoint:** publish. Show what the app does and the preview link from the comment "Vorschau der App". Ask
      whether it may go online. Stop and wait for the yes.
- [ ] Load skill `lernapps-commit`. Publish as skill `lernapps-github` says: `work` into `main` as one squash commit,
      the run of `Pages` watched to its end.
- [ ] Open the address the job `deploy` printed and confirm that the app shows. Never use a derived address.
- [ ] Load skill `lernapps-listing`. Write the entry under "Entry draft" as it says, with the creator's answer to
      "Finding the app".
- [ ] Fill the retrospective.
- [ ] Commit this plan on `main` and push it: the listing check and the review read it there.
- [ ] **Checkpoint:** list. Open the listing pull request as skill `lernapps-listing` says, without asking first: the
      pull request is the review. See it to "bestanden", then show the creator the pull request and its result.
- [ ] If the plan changed since its last push, commit it on `main` and push again.

### Entry draft

<!-- YAML valid against the entry schema the listing skill names. Only known values, never invented. -->

```yaml
```

## Retrospective

<!-- At the end of Commit, before the listing pull request. Facts, short, no names. Read by review and evals. -->

### Phases reached

<!-- Last phase completed, checkpoints passed. E.g. "commit; confirmed, published". -->

### Creator turns after the plan

<!-- Number of creator messages after the confirmation, topic of each. Target: at most 3. -->

### Where I had to guess

<!-- Each gap in plan, skills, messages or answers, and your choice. "None" if none. -->
