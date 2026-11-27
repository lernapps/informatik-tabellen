# Skizzen der Komponenten

## Rechenblatt (Anzeige)

```
      A          B         C        D
 1  Artikel    Preis     Anzahl   Umsatz
 2  Abc Waffel # 2,50    # 40     = B2*C2  → # 100
 3  Abc Saft   # 1,50    # 25     = B3*C3  → # 37,5
```
- Jede Zelle: Typ-Farbe + Symbol (# Zahl, Abc Text, ✓/✗ Wahrheitswert, ⚠ Fehler); Formelzellen zeigen den Wert, darunter die Formelzeile.
- Schritt 1: Zelle anklicken (oder Tab/Pfeiltasten) → Formelzeile zeigt Inhalt, Feld zum Ändern.
- Schritt 2: Wert ändern + Enter → abhängige Zellen rechnen neu (kurz markiert).
- Schritt 3 (Modus Kopieren): Knopf „D2 nach unten kopieren“ → D3…D5 bekommen die Formel; Pfeile von D3 zu B3 und C3; ein $-Bezug zeigt immer auf dieselbe Zelle.
- Fehler: Zelle zeigt #WERT!, unter dem Blatt steht der Grund in einfacher Sprache.

## FormelAufgabe (Übung)

- Blatt wie oben, Zielzelle leer und umrandet, darüber die Aufgabe („Schreib in E2 eine Formel für …, die du nach unten kopieren kannst“).
- Feld „Formel für E2“; während der Eingabe zeigt das Blatt die Werte (auch kopiert), aber nicht „richtig/falsch“.
- „Prüfen“ (vom Explainer): rechnet im gezeigten Blatt und in 3 verdeckten Blättern mit anderen Zahlen. Rückmeldung nennt den Grund.

## Datenfluss (Anzeige)

```
[B2 Preis] [C2 Anzahl]     [B7 Anteil]
     \       /                 |
    [D2 = B2*C2]               |
          \                    |
         [D6 = SUMME(D2:D5)]   |
                   \          /
                 [E6 = D6*B7]
```
- Kästen je Zelle in Ebenen, Pfeil von Quelle zu Ziel. Aufgeklappte Zelle: innen Kästen je Operation (SUMME → >= → WENN).
