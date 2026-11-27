<script setup lang="ts">
// Ein Rechenblatt zum Ansehen und Ausprobieren: Zellen nach Typ markiert, eine Zelle wählen, ihren Inhalt ändern,
// alles rechnet neu. Mit `kopieren` kopiert ein Knopf eine Formel in weitere Zellen; Pfeile zeigen, aus welchen
// Zellen die gewählte Formel liest. Logik in Formel.ts und Gitter.ts.
import { computed, ref } from "vue";
import Gitter from "./Gitter.vue";
import {
  abstand,
  alsText,
  art,
  baue,
  formelInhalt,
  groesse,
  inhalt,
  kopiere,
  quellen,
  rechner,
  type Blatt,
} from "./Formel.ts";
import { sprache as zuSprache, text } from "./FormelAufgabe.ts";
import { anzeige, kopf, pfeile, typName } from "./Gitter.ts";

const props = defineProps<{
  /** Die Sprache der Seite: de oder en. */
  sprache: string;
  zellen: {
    /** @verbatim */
    z: string;
    w?: number;
    t?: string;
    b?: boolean;
    /** @verbatim */
    f?: string;
    ft?: string;
  }[];
  /** Name des Blatts für Screenreader. */
  name: string;
  /** Ob die Lernenden Zellen ändern dürfen. */
  bearbeiten?: boolean;
  /** Eine Formel, die ein Knopf in weitere Zellen kopiert. */
  kopieren?: {
    /** @verbatim */
    von: string;
    /** @verbatim */
    nach: string[];
  };
  /** Die gewählte Zelle am Anfang. @verbatim */
  start?: string;
  texte: {
    /** @verbatim */
    id: string;
    text: string;
  }[];
}>();

const lang = computed(() => zuSprache(props.sprache));
const t = (id: string, w: Record<string, string> = {}) => text(props.texte, id, w) ?? "";

const eigene = ref<Record<string, string>>({});
const kopiert = ref(false);
const auswahl = ref(props.start ?? props.zellen.find((d) => d.f ?? d.ft)?.z ?? props.zellen[0]?.z ?? "A1");
const neu = ref<string[]>([]);

const blatt = computed<Blatt>(() => {
  const b = baue(props.zellen, lang.value);
  for (const [z, s] of Object.entries(eigene.value)) b[z] = inhalt(s, lang.value);
  const k = props.kopieren;
  const quelle = k ? b[k.von] : undefined;
  if (k && kopiert.value && quelle?.art === "formel" && quelle.g.ok) {
    for (const z of k.nach) {
      const [dc, dr] = abstand(k.von, z);
      if (!(z in eigene.value)) b[z] = formelInhalt(kopiere(quelle.g.baum, dc, dr), lang.value);
    }
  }
  return b;
});
const r = computed(() => rechner(blatt.value, lang.value));
const maße = computed(() =>
  groesse([
    ...Object.values(blatt.value).flatMap((c) => (c.art === "formel" && c.g.ok ? quellen(c.g.baum) : [])),
    ...props.zellen.map((d) => d.z),
    ...(props.kopieren?.nach ?? []),
    ...Object.keys(eigene.value),
  ]),
);
const zellen = computed(() =>
  anzeige(blatt.value, r.value, lang.value, props.texte, maße.value.spalten, maße.value.zeilen),
);
const linien = computed(() => pfeile(blatt.value, auswahl.value));

const roh = computed(() => {
  const c = blatt.value[auswahl.value];
  if (!c) return "";
  return c.art === "formel" ? c.text : alsText(c.w, lang.value);
});
const feld = ref(roh.value);
const wert = computed(() => r.value.wert(auswahl.value));
const typ = computed(() => typName(art(wert.value), props.texte));

const grund = computed(() => {
  const c = blatt.value[auswahl.value];
  if (c?.art === "formel" && !c.g.ok)
    return t("lesen-" + c.g.fehler.grund, { info: c.g.fehler.info ?? "", sep: lang.value === "de" ? ";" : "," });
  const w = wert.value;
  return w.t === "fehler" ? t("fehler-" + w.grund, { code: alsText(w, lang.value), info: w.info ?? "" }) : "";
});

function waehle(z: string): void {
  auswahl.value = z;
  feld.value = roh.value;
}

function uebernimm(): void {
  const vorher = Object.fromEntries(zellen.value.map((c) => [c.z, c.text]));
  eigene.value = { ...eigene.value, [auswahl.value]: feld.value };
  neu.value = zellen.value.filter((c) => c.z !== auswahl.value && vorher[c.z] !== c.text).map((c) => c.z);
}

function kopiere_(): void {
  kopiert.value = true;
  neu.value = props.kopieren?.nach ?? [];
  waehle(props.kopieren?.nach[0] ?? auswahl.value);
}

function zuruecksetzen(): void {
  eigene.value = {};
  kopiert.value = false;
  neu.value = [];
  waehle(props.start ?? auswahl.value);
}

const geaendert = computed(() => kopiert.value || Object.keys(eigene.value).length > 0);
const bis = computed(() => {
  const n = props.kopieren?.nach ?? [];
  return n.length > 1 ? `${n[0]}–${n[n.length - 1]}` : (n[0] ?? "");
});
</script>

<template>
  <div class="rechenblatt">
    <Gitter
      :spalten="kopf(maße.spalten)"
      :zeilen="maße.zeilen"
      :zellen="zellen"
      :auswahl="auswahl"
      :neu="neu"
      :pfeile="linien"
      :name="name"
      @waehle="waehle"
    />
    <div class="leiste">
      <label v-if="bearbeiten" class="feld">
        <span>{{ t("inhalt", { z: auswahl }) }}</span>
        <input
          v-model="feld"
          type="text"
          spellcheck="false"
          autocomplete="off"
          @keydown.enter.prevent="uebernimm"
          @change="uebernimm"
        />
      </label>
      <p v-else class="feld">
        <span>{{ t("inhalt", { z: auswahl }) }}</span> <code>{{ roh || "–" }}</code>
      </p>
      <p aria-live="polite">
        {{ t("ergebnis", { z: auswahl, wert: alsText(wert, lang) || "–", typ }) }}
        <span v-if="grund" class="grund">{{ grund }}</span>
      </p>
      <p v-if="linien.length" class="hinweis">{{ t("pfeile", { z: auswahl }) }}</p>
    </div>
    <div v-if="kopieren || (bearbeiten && geaendert)" class="knoepfe">
      <button v-if="kopieren" type="button" :disabled="kopiert" @click="kopiere_">
        {{ t("kopieren", { von: kopieren.von, bis }) }}
      </button>
      <button v-if="geaendert" type="button" @click="zuruecksetzen">{{ t("zuruecksetzen") }}</button>
    </div>
  </div>
</template>

<style scoped>
.rechenblatt {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}
.leiste p {
  margin: 0.25rem 0;
}
.feld {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.feld input {
  font: inherit;
  font-family: ui-monospace, monospace;
  min-height: 2.75rem;
  padding: 0 0.5rem;
  min-width: 12rem;
  flex: 1;
  border: 1px solid var(--page-border);
  background: var(--page-background);
  color: var(--page-text);
}
.grund {
  display: block;
  color: var(--page-wrong);
}
.hinweis {
  color: var(--page-muted);
}
.knoepfe {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.knoepfe button {
  min-height: 2.75rem;
  padding: 0 1rem;
  font: inherit;
  border: 1px solid var(--page-accent);
  border-radius: 4px;
  background: var(--page-accent);
  color: var(--page-on-accent);
  cursor: pointer;
}
.knoepfe button:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
