// Logik der Übung FormelAufgabe: Die Lernenden schreiben eine Formel in eine Zielzelle, bei Kopier-Aufgaben wird sie
// in weitere Zellen kopiert. Geprüft wird nicht der Text, sondern was die Formel rechnet: im gezeigten Blatt und in
// verdeckten Testblättern mit anderen Zahlen, in der Zielzelle und in jeder kopierten Zelle. Reine Funktionen.
import {
  abstand,
  alsText,
  baue,
  bezuege,
  bezugText,
  FEHLERCODE,
  formelInhalt,
  gleich,
  kopiere,
  lies,
  quellen,
  rechner,
  schreibe,
  type Knoten,
  type Lang,
  type Wert,
  type ZelleDef,
} from "./Formel.ts";

export type Text = { id: string; text: string };

export interface Aufgabe {
  /** Die Aufgabe, wie sie über dem Blatt steht. */
  text: string;
  zellen: ZelleDef[];
  /** Die Zelle, in die die Formel kommt. */
  ziel: string;
  /** Zellen, in die die Formel danach kopiert wird. */
  nach?: string[];
  /** Eine richtige Formel, englisch geschrieben. */
  muster: string;
  /** Die Zellen, deren Zahlen sich in den Testblättern ändern. */
  variabel: string[];
  /** Die verdeckten Testblätter: je eine Zahl für jede Zelle aus `variabel`. */
  tests: { w: number[] }[];
}

export interface Props {
  sprache: string;
  aufgaben: Aufgabe[];
  texte: Text[];
}

export type Task = Aufgabe & { l: Lang };

/** Die Formel, die die Lernenden geschrieben haben, und die Sprache, in der sie geschrieben ist. */
export type Answer = { f: string; l: string };

export const sprache = (s: string): Lang => (s === "en" ? "en" : "de");

/** Ein Text der Props mit {name} ausgefüllt. */
export function text(texte: readonly Text[], id: string, werte: Record<string, string> = {}): string | undefined {
  const t = texte.find((x) => x.id === id)?.text;
  return t === undefined ? undefined : t.replace(/\{(\w+)\}/g, (m, k: string) => werte[k] ?? m);
}

export function generate(seed: number, props: Props): Task {
  const n = props.aufgaben.length;
  const a = props.aufgaben[(((seed - 1) % n) + n) % n] as Aufgabe;
  return { ...a, l: sprache(props.sprache) };
}

const ziele = (task: Task) => [task.ziel, ...(task.nach ?? [])];

/** Die Testblätter: zuerst das gezeigte, dann die verdeckten. */
function blaetter(task: Task): Record<string, number>[] {
  return [
    {},
    ...task.tests.map((t) => Object.fromEntries(task.variabel.map((z, i) => [z.toUpperCase(), t.w[i] ?? 0]))),
  ];
}

/** Die Werte der Zielzellen, wenn `baum` in die Zielzelle kommt und von dort kopiert wird. */
export function ergebnis(task: Task, baum: Knoten, werte: Record<string, number>): Wert[] {
  const blatt = baue(task.zellen, task.l, werte);
  for (const z of ziele(task)) {
    const [dc, dr] = abstand(task.ziel, z);
    blatt[z.toUpperCase()] = formelInhalt(kopiere(baum, dc, dr), task.l);
  }
  const r = rechner(blatt, task.l);
  return ziele(task).map((z) => r.wert(z.toUpperCase()));
}

const musterBaum = (task: Task): Knoten => {
  const g = lies(task.muster, "en");
  if (!g.ok) throw new Error("Musterformel nicht lesbar: " + task.muster);
  return g.baum;
};

/** Je Testblatt und Zielzelle: stimmt der Wert mit dem der Musterformel überein? */
function vergleiche(task: Task, baum: Knoten): boolean[][] {
  const m = musterBaum(task);
  return blaetter(task).map((werte) => {
    const soll = ergebnis(task, m, werte);
    const ist = ergebnis(task, baum, werte);
    return soll.map((s, i) => gleich(s, ist[i] ?? { t: "leer" }));
  });
}

export function check(task: Task, answer: Answer | undefined): boolean {
  if (!answer || sprache(answer.l) !== task.l) return false;
  const g = lies(answer.f, task.l);
  if (!g.ok) return false;
  return vergleiche(task, g.baum).every((zeile) => zeile.every(Boolean));
}

export function solution(task: Task): Answer {
  return { f: "=" + schreibe(musterBaum(task), task.l), l: task.l };
}

/** Der Wert der Zielzelle im gezeigten Blatt, als feste Zahl eingetippt. */
function festeZahl(task: Task): Answer {
  const w = ergebnis(task, musterBaum(task), {})[0];
  return { f: "=" + (w ? alsText(w, task.l) : "0"), l: task.l };
}

/** Die Musterformel ohne jedes $. */
function ohneDollar(task: Task): Answer | undefined {
  if (!task.muster.includes("$")) return undefined;
  const a = { f: solution(task).f.replace(/\$/g, ""), l: task.l };
  return check(task, a) ? undefined : a;
}

export function wrong(task: Task): Answer {
  return festeZahl(task);
}

/** Je typischem Fehler aus about.mistakes die eine Antwort, die ihn zeigt. */
export function mistakes(task: Task, _props?: Props): (Answer | undefined)[] {
  return [festeZahl(task), ohneDollar(task), { f: solution(task).f.slice(1), l: task.l }];
}

export function reason(task: Task, answer: Answer, props: Props, _lang?: string): string | undefined {
  const t = (id: string, w: Record<string, string> = {}) => text(props.texte, id, w);
  const g = lies(answer.f, task.l);
  if (!g.ok) {
    const zeichen = g.fehler.info ?? "";
    return t("lesen-" + g.fehler.grund, { info: zeichen, sep: task.l === "de" ? ";" : "," });
  }
  const shown = ergebnis(task, g.baum, {})[0];
  if (shown?.t === "fehler")
    return t("fehler-" + shown.grund, { code: FEHLERCODE[task.l][shown.v], info: shown.info ?? "" });
  if (quellen(g.baum).length === 0) return t("ohne-bezug");
  const v = vergleiche(task, g.baum);
  const zielOk = v.every((zeile) => zeile[0]);
  if (!zielOk && v[0]?.[0]) return t("nur-diese-zahlen");
  if (zielOk) {
    const m = bezuege(musterBaum(task));
    const ich = bezuege(g.baum);
    const fehlt = m.find((r) => (r.absRow || r.absCol) && ich.some((x) => same(x, r) && !x.absRow && !x.absCol));
    if (fehlt) return t("dollar-fehlt", { ref: bezugText({ ...fehlt, absCol: false, absRow: false }) });
    if (ich.some((x) => (x.absRow || x.absCol) && m.some((r) => same(x, r) && !r.absRow && !r.absCol)))
      return t("dollar-zu-viel");
    return t("kopie-falsch");
  }
  if (hatZahl(g.baum)) return t("zahl-statt-bezug");
  return t("andere-zellen", { zellen: quellen(g.baum).join(", ") });
}

/** Ob in der Formel eine feste Zahl steht. */
function hatZahl(k: Knoten): boolean {
  if (k.k === "zahl") return true;
  if (k.k === "minus" || k.k === "klammer") return hatZahl(k.x);
  if (k.k === "op") return hatZahl(k.a) || hatZahl(k.b);
  if (k.k === "fn" || k.k === "unbekannt") return k.args.some(hatZahl);
  return false;
}

const same = (a: { col: number; row: number }, b: { col: number; row: number }) => a.col === b.col && a.row === b.row;

/** Das Blatt als Liste, für den Text ohne JavaScript und den Tutor. */
export function describe(task: Task, props: Props, _lang: string): { task: string; solution: string } {
  const blatt = baue(task.zellen, task.l);
  const r = rechner(blatt, task.l);
  const zeilen = task.zellen.map((d) => {
    const c = blatt[d.z.toUpperCase()];
    const wert = alsText(r.wert(d.z.toUpperCase()), task.l);
    return c?.art === "formel" ? `- ${d.z}: ${c.text} (${wert})` : `- ${d.z}: ${wert}`;
  });
  zeilen.push(`- ${task.ziel}: ${text(props.texte, "deine-formel") ?? "?"}`);
  const nach = task.nach ?? [];
  const kopiert = nach.length
    ? " " + (text(props.texte, "kopiert", { von: nach[0] ?? "", bis: nach[nach.length - 1] ?? "" }) ?? "")
    : "";
  const md = (x: string) => x.replace(/\$/g, "\\$");
  return { task: md(task.text + "\n\n" + zeilen.join("\n")), solution: md(solution(task).f) + kopiert };
}

export function template(_props: Props, _lang: string): string {
  return "{Aufgabe}";
}

export function params(task: Task, _props: Props, _lang: string): Record<string, string> {
  return { Aufgabe: task.text };
}

export function show(answer: Answer, _task?: Task, _props?: Props, _lang?: string): string {
  return answer.f;
}

export const about = {
  task: {
    de: "Ein Rechenblatt der Schulfest-Kasse mit einer leeren Zielzelle. Die Jugendlichen tippen eine Formel in das Feld darunter und drücken „Prüfen“. Bei Kopier-Aufgaben wird die Formel in weitere Zellen kopiert. Geprüft wird, was die Formel rechnet: im gezeigten Blatt und in verdeckten Blättern mit anderen Zahlen.",
    en: "A spreadsheet of the school fair till with one empty target cell. The learners type a formula into the box below it and press “Check”. In copy tasks the formula is copied into more cells. What is checked is what the formula works out: in the sheet shown and in hidden sheets with other numbers.",
  },
  answer: {
    de: "Eine Formel, die mit = beginnt, in deutscher Schreibweise (Funktionsnamen deutsch, ; zwischen Argumenten, Dezimalkomma).",
    en: "A formula that starts with =, written the English way (English function names, a comma between arguments, a decimal point).",
  },
  correct: {
    de: "Richtig, wenn die Formel in jedem Blatt und in jeder kopierten Zelle denselben Wert ergibt wie die Musterformel. Andere Schreibweisen (=C2*B2 statt =B2*C2, Klammern) zählen auch.",
    en: "Correct when the formula gives the same value as the model formula in every sheet and in every copied cell. Other ways of writing it (=C2*B2 instead of =B2*C2, brackets) count too.",
  },
  mistakes: [
    {
      de: "Das Ergebnis als feste Zahl eingetippt statt mit Zellbezügen gerechnet.",
      en: "Typed the result as a fixed number instead of working it out with cell references.",
    },
    {
      de: "Das $ vergessen: Beim Kopieren wandert ein Bezug mit, der fest bleiben muss.",
      en: "Left out the $: when copied, a reference moves that has to stay fixed.",
    },
    { de: "Das = am Anfang vergessen.", en: "Left out the = at the start." },
  ],
};
