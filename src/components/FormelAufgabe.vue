<script setup lang="ts">
// Übung: eine Formel in eine Zielzelle schreiben. Das Blatt rechnet sie gleich aus (und kopiert sie bei
// Kopier-Aufgaben in die weiteren Zellen, mit Pfeilen). Ob sie stimmt, prüft der Explainer mit FormelAufgabe.ts:
// auch in verdeckten Blättern mit anderen Zahlen. Die Komponente sendet nur die Eingabe.
import { computed, ref } from "vue";
import Gitter from "./Gitter.vue";
import { abstand, baue, formelInhalt, groesse, kopiere, quellen, lies, rechner, type Blatt } from "./Formel.ts";
import { generate, text } from "./FormelAufgabe.ts";
import { anzeige, kopf, legende, pfeile } from "./Gitter.ts";

const props = defineProps<{
  /** Die Sprache der Seite: de oder en. */
  sprache: string;
  aufgaben: {
    text: string;
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
    /** @verbatim */
    ziel: string;
    /** @verbatim */
    nach?: string[];
    /** @verbatim */
    muster: string;
    /** @verbatim */
    variabel: string[];
    tests: { w: number[] }[];
  }[];
  texte: {
    /** @verbatim */
    id: string;
    text: string;
  }[];
  seed: number;
  checked?: boolean;
}>();
const emit = defineEmits<{ answer: [{ f: string; l: string } | undefined] }>();

const task = computed(() => generate(props.seed, props));
const t = (id: string, w: Record<string, string> = {}) => text(props.texte, id, w) ?? "";
const eingabe = ref("");
const auswahl = ref(task.value.ziel);

const blatt = computed<Blatt>(() => {
  const b = baue(task.value.zellen, task.value.l);
  const g = lies(eingabe.value, task.value.l);
  // die kopierten Zellen erst nach „Prüfen“: vorher würden sie zeigen, ob die Formel stimmt
  const ziele = [task.value.ziel, ...(props.checked ? (task.value.nach ?? []) : [])];
  if (g.ok)
    for (const z of ziele) {
      const [dc, dr] = abstand(task.value.ziel, z);
      b[z] = formelInhalt(kopiere(g.baum, dc, dr), task.value.l);
    }
  return b;
});
const r = computed(() => rechner(blatt.value, task.value.l));
const maße = computed(() =>
  groesse([
    ...Object.values(blatt.value).flatMap((c) => (c.art === "formel" && c.g.ok ? quellen(c.g.baum) : [])),
    ...task.value.zellen.map((d) => d.z),
    task.value.ziel,
    ...(task.value.nach ?? []),
  ]),
);
const zellen = computed(() =>
  anzeige(blatt.value, r.value, task.value.l, props.texte, maße.value.spalten, maße.value.zeilen),
);
const markiert = computed(() => [task.value.ziel, ...(task.value.nach ?? [])]);
const linien = computed(() => pfeile(blatt.value, auswahl.value));
const lesefehler = computed(() => {
  const g = lies(eingabe.value, task.value.l);
  return eingabe.value.trim() && !g.ok
    ? t("lesen-" + g.fehler.grund, { info: g.fehler.info ?? "", sep: task.value.l === "de" ? ";" : "," })
    : "";
});
const nach = computed(() => task.value.nach ?? []);
const inhaltAuswahl = computed(() => {
  const c = blatt.value[auswahl.value];
  return c?.art === "formel" ? c.text : "";
});

function tippe(): void {
  const f = eingabe.value.trim();
  emit("answer", f ? { f, l: task.value.l } : undefined);
}
</script>

<template>
  <div class="formel-aufgabe">
    <p>{{ task.text }}</p>
    <Gitter
      :spalten="kopf(maße.spalten)"
      :zeilen="maße.zeilen"
      :zellen="zellen"
      :auswahl="auswahl"
      :markiert="markiert"
      :pfeile="linien"
      :name="t('blatt')"
      :legende="legende(texte, false)"
      @waehle="(z: string) => (auswahl = z)"
    />
    <p v-if="inhaltAuswahl" class="hinweis">
      {{ t("inhalt", { z: auswahl }) }} <code>{{ inhaltAuswahl }}</code>
    </p>
    <p v-if="nach.length" class="hinweis">
      {{ t("wird-kopiert", { z: task.ziel, von: nach[0] ?? "", bis: nach[nach.length - 1] ?? "" }) }}
    </p>
    <label class="feld">
      <span>{{ t("formel-fuer", { z: task.ziel }) }}</span>
      <input
        v-model="eingabe"
        type="text"
        spellcheck="false"
        autocomplete="off"
        :class="{ geprueft: checked }"
        @input="tippe"
      />
    </label>
    <p v-if="lesefehler" class="hinweis" aria-live="polite">{{ lesefehler }}</p>
  </div>
</template>

<style scoped>
.formel-aufgabe {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.formel-aufgabe p {
  margin: 0;
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
.feld input.geprueft {
  border-color: var(--page-accent);
}
.hinweis {
  color: var(--page-muted);
}
</style>
