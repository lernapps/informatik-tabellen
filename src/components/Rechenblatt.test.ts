import { expect, test } from "vite-plus/test";
import { abstand, alsText, baue, formelInhalt, kopiere, lies, rechner, type Blatt } from "./Formel.ts";

// Was Rechenblatt.vue beim Knopf „kopieren“ tut: die Formel der Quelle in die Zielzellen, Bezüge verschoben.
function kopiert(f: string, von: string, nach: string[]): Blatt {
  const b = baue(
    [
      { z: "B1", w: 2.5 },
      { z: "B2", t: "verkauft" },
      { z: "B3", w: 18 },
      { z: "B4", w: 25 },
      { z: "C3", f },
    ],
    "de",
  );
  const g = lies(f, "en");
  if (!g.ok) throw new Error(f);
  for (const z of nach) {
    const [dc, dr] = abstand(von, z);
    b[z] = formelInhalt(kopiere(g.baum, dc, dr), "de");
  }
  return b;
}

test("Selins Formel ohne $ liest nach dem Kopieren aus dem Text in B2", () => {
  const b = kopiert("=B3*B1", "C3", ["C4"]);
  expect(b["C4"]?.art === "formel" ? b["C4"].text : "").toBe("=B4*B2");
  expect(alsText(rechner(b, "de").wert("C4"), "de")).toBe("#WERT!");
});

test("mit $B$1 bleibt der Preis fest", () => {
  const b = kopiert("=B3*$B$1", "C3", ["C4"]);
  expect(b["C4"]?.art === "formel" ? b["C4"].text : "").toBe("=B4*$B$1");
  expect(alsText(rechner(b, "de").wert("C4"), "de")).toBe("62,5");
  expect(alsText(rechner(b, "en").wert("C4"), "en")).toBe("62.5");
});
