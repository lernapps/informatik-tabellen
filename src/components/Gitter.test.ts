import { expect, test } from "vite-plus/test";
import { baue, rechner } from "./Formel.ts";
import { anzeige, kopf, pfeile } from "./Gitter.ts";

const texte = [
  { id: "typ-ganz", text: "Zahl (ganze Zahl)" },
  { id: "typ-text", text: "Text" },
  { id: "zelle", text: "– {z}, {typ}" },
  { id: "zelle-formel", text: "– {z}, {typ}, Formel {f}" },
];

test("Zellen mit Wert, Symbol und Namen; Pfeile von den Quellen zur Formel", () => {
  const blatt = baue(
    [
      { z: "A1", t: "Saft" },
      { z: "B1", w: 3 },
      { z: "B2", f: "=B1*$B$1" },
    ],
    "de",
  );
  const z = anzeige(blatt, rechner(blatt, "de"), "de", texte, 2, 2);
  expect(z.map((c) => c.z)).toEqual(["A1", "B1", "A2", "B2"]);
  expect(z[0]).toMatchObject({ text: "Saft", art: "text", symbol: "Abc", label: "– A1, Text" });
  expect(z[3]).toMatchObject({
    text: "9",
    art: "ganz",
    symbol: "#",
    label: "– B2, Zahl (ganze Zahl), Formel =B1*$B$1",
  });
  expect(pfeile(blatt, "B2")).toEqual([
    { von: "B1", nach: "B2", fest: false },
    { von: "B1", nach: "B2", fest: true },
  ]);
  expect(pfeile(blatt, "A1")).toEqual([]);
  expect(kopf(3)).toEqual(["A", "B", "C"]);
});
