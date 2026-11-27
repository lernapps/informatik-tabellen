import { expect, test } from "vite-plus/test";
import {
  check,
  describe,
  generate,
  mistakes,
  reason,
  solution,
  wrong,
  type Aufgabe,
  type Props,
  type Text,
} from "./FormelAufgabe.ts";
import type { ZelleDef } from "./Formel.ts";

// Die Aufgaben wie auf der Seite formeln/bezuege (Texte gekürzt); die Texte der Gründe wie in src/data/texte.yaml.
const sv: ZelleDef[] = [
  { z: "A1", t: "Stand" },
  { z: "B1", t: "Einnahmen" },
  { z: "B2", w: 340 },
  { z: "B3", w: 180 },
  { z: "B4", w: 260 },
  { z: "B5", w: 120 },
  { z: "A7", t: "Anteil SV" },
  { z: "B7", w: 0.1 },
];
const lose: ZelleDef[] = [
  { z: "A1", t: "Preis je Los" },
  { z: "B1", w: 1.5 },
  { z: "B2", t: "verkauft" },
  { z: "B3", w: 22 },
  { z: "B4", w: 40 },
  { z: "B5", w: 35 },
  { z: "B6", w: 16 },
];
const AUFGABEN: Aufgabe[] = [
  {
    text: "Schreib in C2 eine Formel für den Betrag der SV.",
    zellen: sv,
    ziel: "C2",
    nach: ["C3", "C4", "C5"],
    muster: "=B2*$B$7",
    variabel: ["B2", "B3", "B4", "B5", "B7"],
    tests: [{ w: [410, 95, 230, 175, 0.15] }, { w: [120, 300, 80, 45, 0.2] }],
  },
  {
    text: "Schreib in C3 eine Formel für die Einnahmen der Stunde.",
    zellen: lose,
    ziel: "C3",
    nach: ["C4", "C5", "C6"],
    muster: "=B3*$B$1",
    variabel: ["B1", "B3", "B4", "B5", "B6"],
    tests: [{ w: [2, 15, 28, 33, 9] }, { w: [1, 50, 12, 7, 26] }],
  },
  {
    text: "Schreib in D2 eine Formel für die Einnahmen.",
    zellen: [
      { z: "B2", w: 2.5 },
      { z: "C2", w: 40 },
    ],
    ziel: "D2",
    muster: "=B2*C2",
    variabel: ["B2", "C2"],
    tests: [{ w: [1.5, 7] }],
  },
];
const TEXTE: Text[] = [
  { id: "deine-formel", text: "deine Formel" },
  { id: "kopiert", text: "Kopiert nach {von} bis {bis}." },
  { id: "lesen-kein-gleich", text: "Eine Formel beginnt mit =." },
  { id: "lesen-zeichen", text: "Das Blatt kann „{info}“ nicht lesen." },
  { id: "lesen-zu-viel", text: "Zwischen zwei Werten fehlt ein Rechenzeichen." },
  { id: "lesen-erwartet-wert", text: "Nach einem Rechenzeichen muss ein Wert kommen." },
  { id: "fehler-text-rechnen", text: "{code}: „{info}“ ist ein Text." },
  { id: "fehler-div0", text: "{code}: Du teilst durch 0." },
  { id: "fehler-name-unbekannt", text: "{code}: Das Blatt kennt „{info}“ nicht." },
  { id: "fehler-zirkel", text: "{code}: Die Formel liest aus ihrer eigenen Zelle." },
  { id: "ohne-bezug", text: "Deine Formel rechnet nur mit festen Zahlen." },
  { id: "nur-diese-zahlen", text: "Deine Formel stimmt nur für die Zahlen hier." },
  { id: "dollar-fehlt", text: "Beim Kopieren wandert {ref} mit." },
  { id: "dollar-zu-viel", text: "Ein Bezug bleibt fest, der mitwandern muss." },
  { id: "kopie-falsch", text: "In den kopierten Zellen stimmt sie nicht." },
  { id: "andere-zellen", text: "Deine Formel liest aus {zellen}." },
];
const bloecke = () => [{ id: "bezuege", aufgaben: AUFGABEN }];

const props = (aufgaben: Aufgabe[], l: "de" | "en"): Props => ({ sprache: l, aufgaben, texte: TEXTE });

/** Viele Entwürfe einer Formel: Bezüge mit und ohne $, feste Zahlen, Rechenzeichen. */
function entwuerfe(task: Aufgabe): string[] {
  const refs = [...new Set(task.muster.match(/\$?[A-Z]\$?[0-9]+/g) ?? [])].map((r) => r.replace(/\$/g, ""));
  const varianten = (r: string) => {
    const c = r.slice(0, 1);
    const n = r.slice(1);
    return [r, "$" + c + "$" + n, c + "$" + n, "$" + r];
  };
  const teile = refs.flatMap(varianten).concat(["2", "0,1", "10"]);
  const out: string[] = [];
  for (const a of teile) for (const b of teile) for (const op of ["*", "+", "/", "-"]) out.push(`=${a}${op}${b}`);
  return out;
}

for (const block of bloecke()) {
  for (const l of ["de", "en"] as const) {
    const p = props(block.aufgaben, l);
    test(`${block.id} (${l}): Lösung richtig, typische Fehler falsch, mit Grund`, () => {
      for (let seed = 1; seed <= 50; seed++) {
        const task = generate(seed, p);
        expect(check(task, solution(task))).toBe(true);
        expect(check(task, wrong(task))).toBe(false);
        for (const m of mistakes(task))
          if (m) {
            expect(check(task, m)).toBe(false);
            expect(reason(task, m, p, l)).toBeTruthy();
          }
        const d = describe(task, p, l);
        expect(d.task).toContain(task.ziel);
      }
    });
    test(`${block.id} (${l}): jeder angenommene Entwurf rechnet wie die Musterformel`, () => {
      for (let seed = 1; seed <= p.aufgaben.length; seed++) {
        const task = generate(seed, p);
        const fixed = l === "de" ? (s: string) => s : (s: string) => s.replace(/,/g, ".");
        let angenommen = 0;
        for (const e of entwuerfe(task).map(fixed)) {
          const ok = check(task, { f: e, l });
          if (ok) angenommen++;
          // ein abgelehnter Entwurf ohne Lesefehler bekommt einen Grund oder keinen; nie einen Absturz
          if (!ok) reason(task, { f: e, l }, p, l);
        }
        expect(angenommen).toBeGreaterThan(0);
      }
    });
  }
}

test("Gründe für typische Fehler (bezuege, de)", () => {
  const [b] = bloecke();
  const p = props(b?.aufgaben ?? [], "de");
  const task = generate(1, p);
  expect(reason(task, { f: "=B2*B7", l: "de" }, p)).toContain("B7");
  expect(reason(task, { f: "=B2*0,1", l: "de" }, p)).toContain("nur für");
  expect(reason(task, { f: "=34", l: "de" }, p)).toContain("festen Zahlen");
  expect(reason(task, { f: "B2*$B$7", l: "de" }, p)).toContain("=");
  expect(reason(task, { f: "=B2*$A$7", l: "de" }, p)).toContain("#WERT!");
  expect(reason(task, { f: "=$B$2*$B$7", l: "de" }, p)).toContain("mitwandern");
  expect(reason(task, { f: "=B2.5", l: "de" }, p)).toBeTruthy();
  expect(check(task, { f: "=B2*$B$7", l: "en" })).toBe(false);
  expect(check(task, { f: "=(B2)*B$7", l: "de" })).toBe(true);
});
