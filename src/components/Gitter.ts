// Gemeinsame Anzeige-Logik für Gitter.vue: aus einem Blatt die Zellen mit Wert, Typ-Symbol und Namen für
// Screenreader, und die Pfeile einer Formelzelle zu den Zellen, aus denen sie liest.
import { alsText, art, bezuege, spalteName, zelle, type Blatt, type Lang, type Rechner } from "./Formel.ts";
import { text, type Text } from "./FormelAufgabe.ts";

export type Anzeige = { z: string; text: string; art: string; symbol: string; label: string };
export type Pfeil = { von: string; nach: string; fest: boolean };

const SYMBOL: Record<string, string> = { ganz: "#", komma: "#", text: "Abc", fehler: "!", leer: "" };

/** Der Name des Typs eines Werts, aus den Texten der Props. */
export function typName(a: string, texte: readonly Text[]): string {
  return text(texte, "typ-" + a) ?? a;
}

export function anzeige(
  blatt: Blatt,
  r: Rechner,
  lang: Lang,
  texte: readonly Text[],
  spalten: number,
  zeilen: number,
): Anzeige[] {
  const out: Anzeige[] = [];
  for (let row = 0; row < zeilen; row++)
    for (let col = 0; col < spalten; col++) {
      const z = zelle(col, row);
      const w = r.wert(z);
      const a = art(w);
      const wert = alsText(w, lang);
      const c = blatt[z];
      const typ = typName(a, texte);
      const label =
        c?.art === "formel"
          ? (text(texte, "zelle-formel", { z, f: c.text, wert, typ }) ?? z)
          : (text(texte, "zelle", { z, wert: wert || "–", typ }) ?? z);
      const symbol = a === "bool" ? (w.t === "bool" && w.v ? "✓" : "✗") : (SYMBOL[a] ?? "");
      out.push({ z, text: wert, art: a, symbol, label });
    }
  return out;
}

/** Die Pfeile der Formel in Zelle `z`: von jeder Zelle, aus der sie liest, zu `z`. */
export function pfeile(blatt: Blatt, z: string | undefined): Pfeil[] {
  const c = z ? blatt[z] : undefined;
  if (!z || c?.art !== "formel" || !c.g.ok) return [];
  return bezuege(c.g.baum).map((r) => ({ von: zelle(r.col, r.row), nach: z, fest: r.absCol || r.absRow }));
}

export const kopf = (spalten: number) => Array.from({ length: spalten }, (_, i) => spalteName(i));

/** Die Erklärung der Zeichen: Zahl, Text, Wahrheitswert, Fehlerwert, und auf Wunsch „rechnet neu“. */
export function legende(texte: readonly Text[], neu: boolean): { art: string; symbol: string; text: string }[] {
  const l = [
    { art: "ganz", symbol: "#", text: text(texte, "legende-zahl") ?? "" },
    { art: "text", symbol: "Abc", text: text(texte, "legende-text") ?? "" },
    { art: "bool", symbol: "✓ ✗", text: text(texte, "legende-bool") ?? "" },
    { art: "fehler", symbol: "!", text: text(texte, "legende-fehler") ?? "" },
  ];
  if (neu) l.push({ art: "neu", symbol: "", text: text(texte, "legende-neu") ?? "" });
  return l;
}
