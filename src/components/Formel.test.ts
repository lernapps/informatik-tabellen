import { expect, test } from "vite-plus/test";
import {
  lies,
  inhalt,
  rechner,
  alsText,
  kopiere,
  schreibe,
  uebertrage,
  quellen,
  type Blatt,
  type Lang,
} from "./Formel.ts";

const blatt = (zellen: Record<string, string>, lang: Lang = "de"): Blatt =>
  Object.fromEntries(Object.entries(zellen).map(([z, s]) => [z, inhalt(s, lang)]));
const w = (z: Record<string, string>, ziel: string, lang: Lang = "de") =>
  alsText(rechner(blatt(z, lang), lang).wert(ziel), lang);

test("rechnen mit Punkt vor Strich und Komma", () => {
  expect(w({ A1: "2,5", B1: "4", C1: "=A1*B1+1" }, "C1")).toBe("11");
  expect(w({ A1: "2.5", B1: "4", C1: "=A1*B1+1" }, "C1", "en")).toBe("11");
  expect(w({ A1: "=1+2*3" }, "A1")).toBe("7");
  expect(w({ A1: "=(1+2)*3" }, "A1")).toBe("9");
  expect(w({ A1: "=0,1+0,2" }, "A1")).toBe("0,3");
  expect(w({ A1: "=-2*3" }, "A1")).toBe("-6");
});

test("Typen und Fehlerwerte", () => {
  expect(w({ A1: "Waffel", B1: "=A1+2" }, "B1")).toBe("#WERT!");
  expect(w({ A1: '="3"+2' }, "A1")).toBe("#WERT!");
  expect(w({ A1: "=WAHR+1" }, "A1")).toBe("#WERT!");
  expect(w({ A1: "=1/0" }, "A1", "en")).toBe("#DIV/0!");
  expect(w({ A1: "=SUM(1;2)" }, "A1")).toBe("#NAME?");
  const r = rechner(blatt({ A1: "=SUM(1;2)" }), "de").wert("A1");
  expect(r.t === "fehler" ? r.grund : "").toBe("name-sprache");
  expect(w({ A1: "=B1", B1: "=A1" }, "A1")).toBe("#ZIRKEL!");
  expect(w({ A1: "=3>2" }, "A1")).toBe("WAHR");
  expect(w({ A1: "=3>2" }, "A1", "en")).toBe("TRUE");
  expect(w({ A1: '="a"=1' }, "A1")).toBe("#WERT!");
  expect(w({ A1: '="Saft"="saft"' }, "A1")).toBe("WAHR");
  expect(w({ A1: "=3<>3" }, "A1")).toBe("FALSCH");
  expect(w({ A1: "Saft", B1: '=A1&" 2"' }, "B1")).toBe("Saft 2");
});

test("Funktionen", () => {
  const z = {
    A1: "10",
    A2: "20",
    A3: "",
    A4: "x",
    B1: "=SUMME(A1:A4)",
    B2: "=MITTELWERT(A1:A4)",
    B3: '=WENN(B1>=30;"Ziel";"weiter")',
  };
  expect(w(z, "B1")).toBe("30");
  expect(w(z, "B2")).toBe("15");
  expect(w(z, "B3")).toBe("Ziel");
  expect(w({ A1: "=UND(WAHR;3>4)" }, "A1")).toBe("FALSCH");
  expect(w({ A1: "=ODER(WAHR;3>4)" }, "A1")).toBe("WAHR");
  expect(w({ A1: "=NICHT(3>4)" }, "A1")).toBe("WAHR");
  expect(w({ A1: "=UND(1;WAHR)" }, "A1")).toBe("#WERT!");
  expect(w({ A1: "=WENN(1;2;3)" }, "A1")).toBe("#WERT!");
  expect(w({ A1: "=MITTELWERT(B1:B3)" }, "A1")).toBe("#DIV/0!");
  expect(w({ A1: "=IF(AND(TRUE,2>1),SUM(1,2.5),0)" }, "A1", "en")).toBe("3.5");
  expect(w({ A1: "=MAX(3;7;2)" }, "A1")).toBe("7");
});

test("Lesefehler", () => {
  const f = (s: string, lang: Lang = "de") => {
    const g = lies(s, lang);
    return g.ok ? "ok" : g.fehler.grund;
  };
  expect(f("B2*C2")).toBe("kein-gleich");
  expect(f("=SUMME(A1;A2")).toBe("klammer-zu");
  expect(f("=SUMME(A1,A2)")).toBe("trenner");
  expect(f("=SUM(A1;A2)", "en")).toBe("trenner");
  expect(f("=2.5*3")).toBe("zeichen");
  expect(f("=2+")).toBe("erwartet-wert");
  expect(f("=2)")).toBe("klammer-auf");
  expect(f("=NICHT(1;2)")).toBe("argumente");
  expect(f('="abc')).toBe("text-offen");
  expect(f("=SUM(A1,5)", "en")).toBe("ok");
});

test("Kopieren verschiebt relative Teile", () => {
  const g = lies("=B2*$F$1+C$1+$D2", "de");
  expect(g.ok).toBeTruthy();
  if (!g.ok) return;
  expect(schreibe(kopiere(g.baum, 0, 3), "de")).toBe("B5*$F$1+C$1+$D5");
  expect(schreibe(kopiere(g.baum, 2, 0), "de")).toBe("D2*$F$1+E$1+$D2");
  expect(w({ A1: "=1", B1: "" }, "A1")).toBe("1");
  const up = lies("=A1", "de");
  if (up.ok)
    expect(
      alsText(
        rechner({ X1: { art: "formel", text: "", g: { ok: true, baum: kopiere(up.baum, 0, -1) } } }, "de").wert("X1"),
        "de",
      ),
    ).toBe("#BEZUG!");
  expect(quellen(g.baum)).toEqual(["B2", "F1", "C1", "D2"]);
});

test("Übertragen zwischen Sprachen", () => {
  expect(uebertrage('=IF(SUM(D2:D5)>=300,"ok",2.5)', "en", "de")).toBe('=WENN(SUMME(D2:D5)>=300;"ok";2,5)');
  expect(uebertrage("=AND(TRUE,NOT(FALSE))", "en", "de")).toBe("=UND(WAHR;NICHT(FALSCH))");
});
