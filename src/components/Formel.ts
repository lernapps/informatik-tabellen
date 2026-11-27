// Formel.ts – kleiner Formel-Parser und Auswerter für das Rechenblatt (ohne eval).
// Bezüge A1, $A$1, A$1, $A1, Bereiche A1:A5; Operatoren + - * / & = <> < > <= >=;
// Funktionen SUMME/SUM, WENN/IF, UND/AND, ODER/OR, NICHT/NOT, MITTELWERT/AVERAGE, MIN, MAX.
// Deutsch: deutsche Namen, Trennzeichen ";", Dezimalkomma. Englisch: englische Namen, ",", Dezimalpunkt.

export type Lang = "de" | "en";

export type FehlerArt = "wert" | "div0" | "name" | "bezug" | "zirkel";

/** Warum ein Fehler entstand; die Komponente holt den Text dazu aus ihren Props. */
export type Grund =
  | "text-rechnen"
  | "wahr-rechnen"
  | "vergleich-typen"
  | "bedingung"
  | "logik-argument"
  | "text-argument"
  | "div0"
  | "mittelwert-leer"
  | "name-unbekannt"
  | "name-sprache"
  | "bezug-ausserhalb"
  | "zirkel";

export type Wert =
  | { t: "zahl"; v: number }
  | { t: "text"; v: string }
  | { t: "bool"; v: boolean }
  | { t: "leer" }
  | { t: "fehler"; v: FehlerArt; grund: Grund; info?: string };

export type Bezug = { col: number; row: number; absCol: boolean; absRow: boolean };

export type Knoten =
  | { k: "zahl"; v: number }
  | { k: "text"; v: string }
  | { k: "bool"; v: boolean }
  | { k: "ref"; r: Bezug }
  | { k: "bereich"; a: Bezug; b: Bezug }
  | { k: "minus"; x: Knoten }
  | { k: "op"; op: string; a: Knoten; b: Knoten }
  | { k: "klammer"; x: Knoten }
  | { k: "fn"; name: Fn; args: Knoten[] }
  | { k: "unbekannt"; name: string; args: Knoten[] };

export type Fn = "SUM" | "IF" | "AND" | "OR" | "NOT" | "AVERAGE" | "MIN" | "MAX";

/** Was beim Lesen einer Formel schiefgeht. `pos` ist die Stelle im Text. */
export type Lesefehler = {
  grund:
    | "kein-gleich"
    | "leer"
    | "zeichen"
    | "klammer-zu"
    | "klammer-auf"
    | "erwartet-wert"
    | "zu-viel"
    | "argumente"
    | "trenner"
    | "text-offen";
  pos: number;
  info?: string;
};

export type Gelesen = { ok: true; baum: Knoten } | { ok: false; fehler: Lesefehler };

export const NAMEN: Record<Lang, Record<Fn, string>> = {
  de: {
    SUM: "SUMME",
    IF: "WENN",
    AND: "UND",
    OR: "ODER",
    NOT: "NICHT",
    AVERAGE: "MITTELWERT",
    MIN: "MIN",
    MAX: "MAX",
  },
  en: { SUM: "SUM", IF: "IF", AND: "AND", OR: "OR", NOT: "NOT", AVERAGE: "AVERAGE", MIN: "MIN", MAX: "MAX" },
};

const ARGS: Record<Fn, [number, number]> = {
  SUM: [1, 30],
  IF: [2, 3],
  AND: [1, 30],
  OR: [1, 30],
  NOT: [1, 1],
  AVERAGE: [1, 30],
  MIN: [1, 30],
  MAX: [1, 30],
};

export const WAHR: Record<Lang, [string, string]> = { de: ["WAHR", "FALSCH"], en: ["TRUE", "FALSE"] };

export const FEHLERCODE: Record<Lang, Record<FehlerArt, string>> = {
  de: { wert: "#WERT!", div0: "#DIV/0!", name: "#NAME?", bezug: "#BEZUG!", zirkel: "#ZIRKEL!" },
  en: { wert: "#VALUE!", div0: "#DIV/0!", name: "#NAME?", bezug: "#REF!", zirkel: "#CIRC!" },
};

export const SPALTEN = 26;
export const ZEILEN = 99;

const trenner = (lang: Lang) => (lang === "de" ? ";" : ",");
const komma = (lang: Lang) => (lang === "de" ? "," : ".");

// ---------- Bezüge ----------

export function spalteName(col: number): string {
  return String.fromCharCode(65 + col);
}

export function zelle(col: number, row: number): string {
  return spalteName(col) + String(row + 1);
}

/** "B3" → { col: 1, row: 2 }; auch mit $. */
export function leseBezug(s: string): Bezug | undefined {
  const m = /^(\$?)([A-Za-z])(\$?)([0-9]{1,2})$/.exec(s);
  if (!m) return undefined;
  const row = Number(m[4]) - 1;
  if (row < 0) return undefined;
  return { col: (m[2] ?? "A").toUpperCase().charCodeAt(0) - 65, row, absCol: m[1] === "$", absRow: m[3] === "$" };
}

export function bezugText(r: Bezug): string {
  return (r.absCol ? "$" : "") + spalteName(r.col) + (r.absRow ? "$" : "") + String(r.row + 1);
}

// ---------- Lesen ----------

type Tok =
  | { t: "zahl"; v: number; p: number }
  | { t: "text"; v: string; p: number }
  | { t: "name"; v: string; p: number }
  | { t: "ref"; v: Bezug; p: number }
  | { t: "sym"; v: string; p: number };

function zerlege(s: string, lang: Lang): Tok[] | Lesefehler {
  const out: Tok[] = [];
  const at = (k: number): string => s[k] ?? "";
  const dez = komma(lang);
  let i = 0;
  while (i < s.length) {
    const c = at(i);
    if (c === " ") {
      i++;
      continue;
    }
    if (c === '"' || c === "“" || c === "„" || c === "”") {
      let j = i + 1;
      while (j < s.length && !'"“”'.includes(at(j))) j++;
      if (j >= s.length) return { grund: "text-offen", pos: i };
      out.push({ t: "text", v: s.slice(i + 1, j), p: i });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(c) || (c === dez && /[0-9]/.test(at(i + 1)))) {
      let j = i;
      while (j < s.length && /[0-9]/.test(at(j))) j++;
      let txt = s.slice(i, j);
      if (at(j) === dez && /[0-9]/.test(at(j + 1))) {
        let k = j + 1;
        while (k < s.length && /[0-9]/.test(at(k))) k++;
        txt += "." + s.slice(j + 1, k);
        j = k;
      } else if ((at(j) === "," || at(j) === ".") && at(j) !== trenner(lang) && /[0-9]/.test(at(j + 1))) {
        // Dezimaltrenner der anderen Sprache
        return { grund: "zeichen", pos: j, info: at(j) };
      }
      if (txt.startsWith(".")) txt = "0" + txt;
      out.push({ t: "zahl", v: Number(txt), p: i });
      i = j;
      continue;
    }
    if (/[A-Za-zÄÖÜäöü$]/.test(c)) {
      let j = i;
      while (j < s.length && /[A-Za-zÄÖÜäöü0-9$_.]/.test(at(j))) j++;
      const w = s.slice(i, j);
      const r = leseBezug(w);
      if (r) out.push({ t: "ref", v: r, p: i });
      else if (/^[A-Za-zÄÖÜäöü][A-Za-zÄÖÜäöü0-9_.]*$/.test(w)) out.push({ t: "name", v: w.toUpperCase(), p: i });
      else return { grund: "zeichen", pos: i, info: w };
      i = j;
      continue;
    }
    const zwei = s.slice(i, i + 2);
    if (zwei === "<=" || zwei === ">=" || zwei === "<>") {
      out.push({ t: "sym", v: zwei, p: i });
      i += 2;
      continue;
    }
    if ("+-*/&=<>():;,".includes(c)) {
      out.push({ t: "sym", v: c, p: i });
      i++;
      continue;
    }
    return { grund: "zeichen", pos: i, info: c };
  }
  return out;
}

function tokText(t: Tok | undefined): string {
  if (t === undefined) return "";
  if (t.t === "ref") return bezugText(t.v);
  return String(t.v);
}

function istLesefehler(x: unknown): x is Lesefehler {
  return typeof x === "object" && x !== null && "grund" in x;
}

/** Liest eine Formel wie "=B2*C2" (mit "="). */
export function lies(eingabe: string, lang: Lang): Gelesen {
  const s = eingabe.trim();
  if (!s.startsWith("=")) return { ok: false, fehler: { grund: "kein-gleich", pos: 0 } };
  if (s.length === 1) return { ok: false, fehler: { grund: "leer", pos: 1 } };
  const toks = zerlege(s.slice(1), lang);
  if (istLesefehler(toks)) return { ok: false, fehler: { ...toks, pos: toks.pos + 1 } };
  let i = 0;
  const sep = trenner(lang);
  const ende = s.length;
  const pos = () => (toks[i]?.p ?? ende - 1) + 1;
  const ist = (v: string) => {
    const t = toks[i];
    return t !== undefined && t.t === "sym" && t.v === v;
  };
  const nimm = (): string => {
    const t = toks[i++];
    return t !== undefined && t.t === "sym" ? t.v : "";
  };
  class Halt {
    f: Lesefehler;
    constructor(f: Lesefehler) {
      this.f = f;
    }
  }
  const halt = (grund: Lesefehler["grund"], info?: string): never => {
    throw new Halt({ grund, pos: pos(), ...(info !== undefined ? { info } : {}) });
  };

  const vergleich = (): Knoten => {
    let a = verkettung();
    for (;;) {
      const t = toks[i];
      if (t === undefined || t.t !== "sym" || !["=", "<>", "<", ">", "<=", ">="].includes(t.v)) break;
      i++;
      a = { k: "op", op: t.v, a, b: verkettung() };
    }
    return a;
  };
  const verkettung = (): Knoten => {
    let a = summe();
    while (ist("&")) {
      i++;
      a = { k: "op", op: "&", a, b: summe() };
    }
    return a;
  };
  const summe = (): Knoten => {
    let a = produkt();
    while (ist("+") || ist("-")) {
      const op = nimm();
      a = { k: "op", op, a, b: produkt() };
    }
    return a;
  };
  const produkt = (): Knoten => {
    let a = vorzeichen();
    while (ist("*") || ist("/")) {
      const op = nimm();
      a = { k: "op", op, a, b: vorzeichen() };
    }
    return a;
  };
  const vorzeichen = (): Knoten => {
    if (ist("-")) {
      i++;
      return { k: "minus", x: vorzeichen() };
    }
    if (ist("+")) {
      i++;
      return vorzeichen();
    }
    return atom();
  };
  const atom = (): Knoten => {
    const t = toks[i];
    if (t === undefined) return halt("erwartet-wert");
    if (t.t === "zahl") {
      i++;
      return { k: "zahl", v: t.v };
    }
    if (t.t === "text") {
      i++;
      return { k: "text", v: t.v };
    }
    if (t.t === "ref") {
      i++;
      if (ist(":")) {
        i++;
        const b = toks[i];
        if (!b || b.t !== "ref") return halt("erwartet-wert");
        i++;
        return { k: "bereich", a: t.v, b: b.v };
      }
      return { k: "ref", r: t.v };
    }
    if (t.t === "name") {
      i++;
      if (!ist("(")) {
        const w = WAHR[lang].indexOf(t.v);
        if (w >= 0) return { k: "bool", v: w === 0 };
        return { k: "unbekannt", name: t.v, args: [] };
      }
      i++;
      const args: Knoten[] = [];
      if (!ist(")")) {
        for (;;) {
          args.push(vergleich());
          if (ist(sep)) {
            i++;
            continue;
          }
          if (ist(";") || ist(",")) halt("trenner", sep);
          break;
        }
      }
      if (!ist(")")) halt("klammer-zu");
      i++;
      const fn = (Object.keys(NAMEN[lang]) as Fn[]).find((f) => NAMEN[lang][f] === t.v);
      if (!fn) return { k: "unbekannt", name: t.v, args };
      const [min, max] = ARGS[fn];
      if (args.length < min || args.length > max) halt("argumente", t.v);
      return { k: "fn", name: fn, args };
    }
    if (t.v === "(") {
      i++;
      const x = vergleich();
      if (!ist(")")) halt("klammer-zu");
      i++;
      return { k: "klammer", x };
    }
    if (t.v === ")") return halt("klammer-auf");
    if (t.v === ";" || t.v === ",") return halt("trenner", sep);
    return halt("erwartet-wert", t.v);
  };

  try {
    const baum = vergleich();
    if (i < toks.length) {
      if (ist(")")) halt("klammer-auf");
      if (ist(";") || ist(",")) halt("trenner", sep);
      halt("zu-viel", tokText(toks[i]));
    }
    return { ok: true, baum };
  } catch (e) {
    if (e instanceof Halt) return { ok: false, fehler: e.f };
    throw e;
  }
}

// ---------- Schreiben ----------

export function zahlText(n: number, lang: Lang): string {
  const r = Math.round(n * 1e9) / 1e9;
  const s = String(Object.is(r, -0) ? 0 : r);
  return lang === "de" ? s.replace(".", ",") : s;
}

export function schreibe(k: Knoten, lang: Lang): string {
  switch (k.k) {
    case "zahl":
      return zahlText(k.v, lang);
    case "text":
      return '"' + k.v + '"';
    case "bool":
      return WAHR[lang][k.v ? 0 : 1];
    case "ref":
      return bezugText(k.r);
    case "bereich":
      return bezugText(k.a) + ":" + bezugText(k.b);
    case "minus":
      return "-" + schreibe(k.x, lang);
    case "klammer":
      return "(" + schreibe(k.x, lang) + ")";
    case "op":
      return schreibe(k.a, lang) + k.op + schreibe(k.b, lang);
    case "fn":
      return NAMEN[lang][k.name] + "(" + k.args.map((a) => schreibe(a, lang)).join(trenner(lang)) + ")";
    case "unbekannt":
      return k.name + (k.args.length ? "(" + k.args.map((a) => schreibe(a, lang)).join(trenner(lang)) + ")" : "");
  }
}

/** Formel aus der Ausgangsform (Englisch) in eine Sprache übertragen. */
export function uebertrage(formel: string, von: Lang, nach: Lang): string {
  const g = lies(formel, von);
  if (!g.ok) throw new Error("Formel nicht lesbar: " + formel);
  return "=" + schreibe(g.baum, nach);
}

// ---------- Kopieren ----------

function schiebeBezug(r: Bezug, dc: number, dr: number): Bezug | undefined {
  const col = r.absCol ? r.col : r.col + dc;
  const row = r.absRow ? r.row : r.row + dr;
  if (col < 0 || row < 0 || col >= SPALTEN || row >= ZEILEN) return undefined;
  return { ...r, col, row };
}

/** Kopiert eine Formel um dc Spalten und dr Zeilen. Ein Bezug, der aus dem Blatt fällt, wird #BEZUG!. */
export function kopiere(k: Knoten, dc: number, dr: number): Knoten {
  switch (k.k) {
    case "ref": {
      const r = schiebeBezug(k.r, dc, dr);
      return r ? { k: "ref", r } : { k: "unbekannt", name: "#REF!", args: [] };
    }
    case "bereich": {
      const a = schiebeBezug(k.a, dc, dr);
      const b = schiebeBezug(k.b, dc, dr);
      return a && b ? { k: "bereich", a, b } : { k: "unbekannt", name: "#REF!", args: [] };
    }
    case "minus":
      return { k: "minus", x: kopiere(k.x, dc, dr) };
    case "klammer":
      return { k: "klammer", x: kopiere(k.x, dc, dr) };
    case "op":
      return { ...k, a: kopiere(k.a, dc, dr), b: kopiere(k.b, dc, dr) };
    case "fn":
    case "unbekannt":
      return { ...k, args: k.args.map((a) => kopiere(a, dc, dr)) };
    default:
      return k;
  }
}

/** Alle Bezüge einer Formel in Lesereihenfolge, mit ihrer Stelle im geschriebenen Text (für die Pfeile). */
export function bezuege(k: Knoten): Bezug[] {
  const out: Bezug[] = [];
  const geh = (x: Knoten) => {
    if (x.k === "ref") out.push(x.r);
    else if (x.k === "bereich") out.push(x.a, x.b);
    else if (x.k === "minus" || x.k === "klammer") geh(x.x);
    else if (x.k === "op") {
      geh(x.a);
      geh(x.b);
    } else if (x.k === "fn" || x.k === "unbekannt") x.args.forEach(geh);
  };
  geh(k);
  return out;
}

/** Die Zellen, aus denen eine Formel liest (Bereiche aufgelöst), ohne Doppelte. */
export function quellen(k: Knoten): string[] {
  const set: string[] = [];
  const add = (c: string) => {
    if (!set.includes(c)) set.push(c);
  };
  const geh = (x: Knoten) => {
    if (x.k === "ref") add(zelle(x.r.col, x.r.row));
    else if (x.k === "bereich") {
      for (const [c, r] of bereichZellen(x.a, x.b)) add(zelle(c, r));
    } else if (x.k === "minus" || x.k === "klammer") geh(x.x);
    else if (x.k === "op") {
      geh(x.a);
      geh(x.b);
    } else if (x.k === "fn" || x.k === "unbekannt") x.args.forEach(geh);
  };
  geh(k);
  return set;
}

function bereichZellen(a: Bezug, b: Bezug): [number, number][] {
  const out: [number, number][] = [];
  for (let r = Math.min(a.row, b.row); r <= Math.max(a.row, b.row); r++)
    for (let c = Math.min(a.col, b.col); c <= Math.max(a.col, b.col); c++) out.push([c, r]);
  return out;
}

// ---------- Blatt und Auswerten ----------

/** Inhalt einer Zelle: ein fester Wert oder eine Formel (gelesen). */
export type Inhalt = { art: "wert"; w: Wert } | { art: "formel"; text: string; g: Gelesen };

export type Blatt = Record<string, Inhalt>;

/** Was jemand in eine Zelle tippt: "=…" ist eine Formel, sonst Zahl, Wahrheitswert oder Text. */
export function inhalt(eingabe: string, lang: Lang): Inhalt {
  const s = eingabe.trim();
  if (s.startsWith("=")) return { art: "formel", text: s, g: lies(s, lang) };
  if (s === "") return { art: "wert", w: { t: "leer" } };
  const zahl = lang === "de" ? /^-?[0-9]+(,[0-9]+)?$/ : /^-?[0-9]+(\.[0-9]+)?$/;
  if (zahl.test(s)) return { art: "wert", w: { t: "zahl", v: Number(s.replace(",", ".")) } };
  const w = WAHR[lang].indexOf(s.toUpperCase());
  if (w >= 0) return { art: "wert", w: { t: "bool", v: w === 0 } };
  return { art: "wert", w: { t: "text", v: s } };
}

const F = (v: FehlerArt, grund: Grund, info?: string): Wert =>
  info === undefined ? { t: "fehler", v, grund } : { t: "fehler", v, grund, info };

export type Rechner = { wert: (zelle: string) => Wert };

/** Rechnet ein Blatt aus. `lang` braucht es nur für die Namen in Fehlerhinweisen. */
export function rechner(blatt: Blatt, lang: Lang): Rechner {
  const fertig = new Map<string, Wert>();
  const gerade = new Set<string>();
  const wert = (z: string): Wert => {
    const f = fertig.get(z);
    if (f) return f;
    const c = blatt[z];
    if (!c) return { t: "leer" };
    if (c.art === "wert") return c.w;
    if (gerade.has(z)) return F("zirkel", "zirkel", z);
    gerade.add(z);
    const w: Wert = c.g.ok ? rechne(c.g.baum) : F("name", "name-unbekannt");
    gerade.delete(z);
    fertig.set(z, w);
    return w;
  };
  const zahlVon = (w: Wert): number | Wert => {
    if (w.t === "zahl") return w.v;
    if (w.t === "leer") return 0;
    if (w.t === "fehler") return w;
    if (w.t === "text") return F("wert", "text-rechnen", w.v);
    return F("wert", "wahr-rechnen");
  };
  const liste = (args: Knoten[], art: "zahl" | "bool"): Wert[] | Wert => {
    const out: Wert[] = [];
    for (const a of args) {
      if (a.k === "bereich") {
        for (const [c, r] of bereichZellen(a.a, a.b)) {
          const w = wert(zelle(c, r));
          if (w.t === "fehler") return w;
          if ((art === "zahl" && w.t === "zahl") || (art === "bool" && w.t === "bool")) out.push(w);
        }
      } else {
        const w = rechne(a);
        if (w.t === "fehler") return w;
        if (art === "zahl") {
          if (w.t === "text") return F("wert", "text-argument", w.v);
          if (w.t === "bool") return F("wert", "wahr-rechnen");
          if (w.t === "zahl") out.push(w);
        } else {
          if (w.t !== "bool" && !(w.t === "leer" && a.k === "ref")) return F("wert", "logik-argument");
          if (w.t === "bool") out.push(w);
        }
      }
    }
    return out;
  };
  const rechne = (k: Knoten): Wert => {
    switch (k.k) {
      case "zahl":
        return { t: "zahl", v: k.v };
      case "text":
        return { t: "text", v: k.v };
      case "bool":
        return { t: "bool", v: k.v };
      case "ref":
        return wert(zelle(k.r.col, k.r.row));
      case "bereich":
        return F("wert", "text-argument");
      case "klammer":
        return rechne(k.x);
      case "minus": {
        const n = zahlVon(rechne(k.x));
        return typeof n === "number" ? { t: "zahl", v: -n } : n;
      }
      case "unbekannt":
        if (k.name === "#REF!") return F("bezug", "bezug-ausserhalb");
        {
          const andere: Lang = lang === "de" ? "en" : "de";
          const fn = (Object.keys(NAMEN[andere]) as Fn[]).find((f) => NAMEN[andere][f] === k.name);
          return fn ? F("name", "name-sprache", NAMEN[lang][fn]) : F("name", "name-unbekannt", k.name);
        }
      case "op": {
        const a = rechne(k.a);
        if (a.t === "fehler") return a;
        const b = rechne(k.b);
        if (b.t === "fehler") return b;
        if (k.op === "&") return { t: "text", v: alsText(a, lang) + alsText(b, lang) };
        if (["+", "-", "*", "/"].includes(k.op)) {
          const x = zahlVon(a);
          if (typeof x !== "number") return x;
          const y = zahlVon(b);
          if (typeof y !== "number") return y;
          if (k.op === "+") return { t: "zahl", v: x + y };
          if (k.op === "-") return { t: "zahl", v: x - y };
          if (k.op === "*") return { t: "zahl", v: x * y };
          if (y === 0) return F("div0", "div0");
          return { t: "zahl", v: x / y };
        }
        // Vergleich: nur gleiche Typen; eine leere Zelle passt sich an.
        const ta = a.t === "leer" ? (b.t === "leer" ? "zahl" : b.t) : a.t;
        const tb = b.t === "leer" ? ta : b.t;
        if (ta !== tb) return F("wert", "vergleich-typen");
        const va = vergleichsWert(a, ta);
        const vb = vergleichsWert(b, tb);
        const d = va < vb ? -1 : va > vb ? 1 : 0;
        const ergebnis =
          k.op === "="
            ? d === 0
            : k.op === "<>"
              ? d !== 0
              : k.op === "<"
                ? d < 0
                : k.op === ">"
                  ? d > 0
                  : k.op === "<="
                    ? d <= 0
                    : d >= 0;
        return { t: "bool", v: ergebnis };
      }
      case "fn":
        return funktion(k.name, k.args);
    }
  };
  const funktion = (name: Fn, args: Knoten[]): Wert => {
    const leer: Knoten = { k: "bool", v: false };
    const arg = (n: number): Knoten => args[n] ?? leer;
    if (name === "IF") {
      const b = rechne(arg(0));
      if (b.t === "fehler") return b;
      if (b.t !== "bool") return F("wert", "bedingung");
      if (b.v) return rechne(arg(1));
      return args.length > 2 ? rechne(arg(2)) : { t: "bool", v: false };
    }
    if (name === "AND" || name === "OR") {
      const l = liste(args, "bool");
      if (!Array.isArray(l)) return l;
      if (l.length === 0) return F("wert", "logik-argument");
      const vs = l.map((w) => w.t === "bool" && w.v);
      return { t: "bool", v: name === "AND" ? vs.every(Boolean) : vs.some(Boolean) };
    }
    if (name === "NOT") {
      const w = rechne(arg(0));
      if (w.t === "fehler") return w;
      if (w.t !== "bool") return F("wert", "logik-argument");
      return { t: "bool", v: !w.v };
    }
    const l = liste(args, "zahl");
    if (!Array.isArray(l)) return l;
    const ns = l.map((w) => (w.t === "zahl" ? w.v : 0));
    if (name === "SUM") return { t: "zahl", v: ns.reduce((s, n) => s + n, 0) };
    if (name === "AVERAGE") {
      if (ns.length === 0) return F("div0", "mittelwert-leer");
      return { t: "zahl", v: ns.reduce((s, n) => s + n, 0) / ns.length };
    }
    if (ns.length === 0) return { t: "zahl", v: 0 };
    return { t: "zahl", v: name === "MIN" ? Math.min(...ns) : Math.max(...ns) };
  };
  return { wert };
}

function vergleichsWert(w: Wert, t: string): number | string {
  if (w.t === "zahl") return w.v;
  if (w.t === "bool") return w.v ? 1 : 0;
  if (w.t === "text") return w.v.toLowerCase();
  return t === "text" ? "" : 0;
}

/** Ein Wert, wie er in der Zelle steht. */
export function alsText(w: Wert, lang: Lang): string {
  switch (w.t) {
    case "zahl":
      return zahlText(w.v, lang);
    case "text":
      return w.v;
    case "bool":
      return WAHR[lang][w.v ? 0 : 1];
    case "leer":
      return "";
    case "fehler":
      return FEHLERCODE[lang][w.v];
  }
}

/** Zwei Werte gleich? Zahlen mit kleiner Toleranz (Kommazahlen der Rechnung). */
export function gleich(a: Wert, b: Wert): boolean {
  if (a.t !== b.t) return false;
  if (a.t === "zahl" && b.t === "zahl") return Math.abs(a.v - b.v) < 1e-9;
  if (a.t === "text" && b.t === "text") return a.v.toLowerCase() === b.v.toLowerCase();
  if (a.t === "bool" && b.t === "bool") return a.v === b.v;
  if (a.t === "fehler" && b.t === "fehler") return a.v === b.v;
  return true;
}

// ---------- Blätter aus Props ----------

/**
 * Eine Zelle, wie sie in den Props steht: eine Zahl `w`, ein Text `t`, ein Wahrheitswert `b` oder eine Formel `f`
 * (englische Schreibweise, z. B. "=B2*$B$8"); `ft` ist eine Formel mit Text in der Sprache der Seite.
 */
export type ZelleDef = { z: string; w?: number; t?: string; b?: boolean; f?: string; ft?: string };

/** Die Formel einer Zelle, gelesen. */
export function formelVon(d: ZelleDef, lang: Lang): Gelesen | undefined {
  if (d.ft !== undefined) return lies(d.ft, lang);
  if (d.f !== undefined) return lies(d.f, "en");
  return undefined;
}

/** Ein Blatt aus den Zellen der Props; `werte` ersetzt Zahlen einzelner Zellen (Testblätter). */
export function baue(defs: readonly ZelleDef[], lang: Lang, werte: Record<string, number> = {}): Blatt {
  const blatt: Blatt = {};
  for (const d of defs) {
    const g = formelVon(d, lang);
    const z = d.z.toUpperCase();
    if (g) blatt[z] = { art: "formel", text: g.ok ? "=" + schreibe(g.baum, lang) : (d.ft ?? d.f ?? ""), g };
    else if (z in werte) blatt[z] = { art: "wert", w: { t: "zahl", v: werte[z] ?? 0 } };
    else if (d.w !== undefined) blatt[z] = { art: "wert", w: { t: "zahl", v: d.w } };
    else if (d.b !== undefined) blatt[z] = { art: "wert", w: { t: "bool", v: d.b } };
    else if (d.t !== undefined) blatt[z] = { art: "wert", w: { t: "text", v: d.t } };
  }
  for (const [z, v] of Object.entries(werte)) if (!(z in blatt)) blatt[z] = { art: "wert", w: { t: "zahl", v } };
  return blatt;
}

/** Die Formel als Inhalt einer Zelle. */
export function formelInhalt(k: Knoten, lang: Lang): Inhalt {
  return { art: "formel", text: "=" + schreibe(k, lang), g: { ok: true, baum: k } };
}

/** Größe eines Blatts: die höchste Spalte und Zeile, die vorkommt. */
export function groesse(zellen: readonly string[]): { spalten: number; zeilen: number } {
  let spalten = 1;
  let zeilen = 1;
  for (const z of zellen) {
    const r = leseBezug(z);
    if (!r) continue;
    spalten = Math.max(spalten, r.col + 1);
    zeilen = Math.max(zeilen, r.row + 1);
  }
  return { spalten, zeilen };
}

/** Der Abstand zweier Zellen in Spalten und Zeilen. */
export function abstand(von: string, nach: string): [number, number] {
  const a = leseBezug(von);
  const b = leseBezug(nach);
  if (!a || !b) return [0, 0];
  return [b.col - a.col, b.row - a.row];
}

/** Die Art eines Werts für die Anzeige: Typ und, bei Zahlen, ganze Zahl oder Kommazahl. */
export function art(w: Wert): "ganz" | "komma" | "text" | "bool" | "fehler" | "leer" {
  if (w.t === "zahl") return Number.isInteger(Math.round(w.v * 1e9) / 1e9) ? "ganz" : "komma";
  return w.t;
}
