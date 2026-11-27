<script setup lang="ts">
// Das Gitter eines Rechenblatts: Zellen mit Wert und Typ-Symbol, eine gewählte Zelle, Pfeile von den Zellen, aus
// denen eine Formel liest, zur Formelzelle. Nur Anzeige und Auswahl; Rechenblatt.vue und FormelAufgabe.vue füllen es.
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";

const props = defineProps<{
  spalten: string[];
  zeilen: number;
  zellen: { z: string; text: string; art: string; symbol: string; label: string }[];
  auswahl?: string;
  markiert?: string[];
  neu?: string[];
  pfeile?: { von: string; nach: string; fest: boolean }[];
  /** Name des Gitters für Screenreader. */
  name: string;
  /** Die Erklärung der Zeichen unter dem Gitter. */
  legende?: { art: string; symbol: string; text: string }[];
}>();
const emit = defineEmits<{ waehle: [string] }>();

const huelle = ref<HTMLElement | null>(null);
const linien = ref<{ x1: number; y1: number; x2: number; y2: number; fest: boolean }[]>([]);
const flaeche = ref({ w: 0, h: 0 });
let stop: (() => void) | undefined;
const spitze = "spitze-" + useId();

function kasten(z: string): { x: number; y: number; w: number; h: number } | undefined {
  const h = huelle.value;
  const el = h?.querySelector<HTMLElement>(`[data-z="${z}"]`);
  if (!h || !el) return undefined;
  const a = h.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  return {
    x: b.left - a.left + h.scrollLeft + b.width / 2,
    y: b.top - a.top + b.height / 2,
    w: b.width / 2,
    h: b.height / 2,
  };
}

// wie weit man von der Mitte eines Kastens in Richtung (dx, dy) gehen muss, um seinen Rand zu erreichen
const rand = (k: { w: number; h: number }, dx: number, dy: number) =>
  Math.min(dx ? k.w / Math.abs(dx) : Infinity, dy ? k.h / Math.abs(dy) : Infinity);

function messe(): void {
  const h = huelle.value;
  if (!h) return;
  flaeche.value = { w: h.scrollWidth, h: h.scrollHeight };
  linien.value = (props.pfeile ?? []).flatMap((p) => {
    const a = kasten(p.von);
    const b = kasten(p.nach);
    if (!a || !b || p.von === p.nach) return [];
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    if (!(d > 1) || a.w === 0 || b.w === 0) return [];
    const dx = (b.x - a.x) / d;
    const dy = (b.y - a.y) / d;
    const ta = rand(a, dx, dy);
    const tb = rand(b, dx, dy) + 2;
    if (!Number.isFinite(ta) || !Number.isFinite(tb)) return [];
    return [{ x1: a.x + dx * ta, y1: a.y + dy * ta, x2: b.x - dx * tb, y2: b.y - dy * tb, fest: p.fest }];
  });
}

onMounted(() => {
  messe();
  const o = new ResizeObserver(() => messe());
  if (huelle.value) o.observe(huelle.value);
  stop = () => o.disconnect();
});
onBeforeUnmount(() => stop?.());
watch(
  () => [props.pfeile, props.zellen],
  () => void nextTick(messe),
  { deep: true },
);

function taste(e: KeyboardEvent, z: string): void {
  const i = props.zellen.findIndex((c) => c.z === z);
  const n = props.spalten.length;
  const ziel =
    e.key === "ArrowRight"
      ? i + 1
      : e.key === "ArrowLeft"
        ? i - 1
        : e.key === "ArrowDown"
          ? i + n
          : e.key === "ArrowUp"
            ? i - n
            : -1;
  const c = props.zellen[ziel];
  const quer = e.key === "ArrowRight" || e.key === "ArrowLeft";
  if (ziel < 0 || !c || (quer && Math.floor(ziel / n) !== Math.floor(i / n))) return;
  e.preventDefault();
  emit("waehle", c.z);
  void nextTick(() => huelle.value?.querySelector<HTMLElement>(`[data-z="${c.z}"]`)?.focus());
}

const reihe = (r: number) => props.zellen.slice(r * props.spalten.length, (r + 1) * props.spalten.length);
const fokus = (z: string) => (props.auswahl ?? props.zellen[0]?.z) === z;
</script>

<template>
  <div ref="huelle" class="gitter">
    <table :aria-label="name" :style="{ minWidth: `${2 + spalten.length * 4.2}rem` }">
      <thead>
        <tr>
          <th aria-hidden="true"></th>
          <th v-for="s in spalten" :key="s" scope="col">{{ s }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in zeilen" :key="r">
          <th scope="row">{{ r }}</th>
          <td v-for="c in reihe(r - 1)" :key="c.z">
            <button
              type="button"
              :data-z="c.z"
              :class="[
                'zelle',
                'art-' + c.art,
                { gewaehlt: auswahl === c.z, markiert: markiert?.includes(c.z), neu: neu?.includes(c.z) },
              ]"
              :tabindex="fokus(c.z) ? 0 : -1"
              :aria-pressed="auswahl === c.z"
              @click="emit('waehle', c.z)"
              @keydown="taste($event, c.z)"
            >
              <span class="symbol" aria-hidden="true">{{ c.symbol }}</span>
              <span class="wert">{{ c.text }}</span>
              <span class="nur-vorlesen">{{ c.label }}</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <ul v-if="legende?.length" class="legende">
      <li v-for="l in legende" :key="l.art" :class="'art-' + l.art">
        <span class="symbol-legende" aria-hidden="true">{{ l.symbol }}</span> {{ l.text }}
      </li>
    </ul>
    <svg
      v-if="linien.length"
      class="pfeile"
      :width="flaeche.w"
      :height="flaeche.h"
      :viewBox="`0 0 ${flaeche.w} ${flaeche.h}`"
      aria-hidden="true"
    >
      <defs>
        <marker :id="spitze" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" class="spitze" />
        </marker>
      </defs>
      <g v-for="(l, i) in linien" :key="i">
        <line :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" :class="{ fest: l.fest }" :marker-end="`url(#${spitze})`" />
        <text v-if="l.fest" :x="(l.x1 + l.x2) / 2 + 6" :y="(l.y1 + l.y2) / 2 - 6" class="dollar">$</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.gitter {
  max-width: 40rem;
  margin-left: -7px;
  --zahl: #2f5fb3;
  --text: #6a4c93;
  --wahr: #23704a;
  --fehler: #b3261e;
  --pfeil: #a4500f;
  position: relative;
  overflow-x: auto;
  max-width: 100%;
}
@media (prefers-color-scheme: dark) {
  .gitter {
    --zahl: #8fb0ff;
    --text: #c9a8ff;
    --wahr: #6fd19a;
    --fehler: #ff8a80;
    --pfeil: #f0a060;
  }
}
table {
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 7px 3px;
  color: var(--page-text);
}
th:first-child {
  width: 1.4rem;
}
th {
  font-weight: 600;
  color: var(--page-muted);
  padding: 0.25rem;
  text-align: center;
}
td {
  padding: 0;
}
.zelle {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  min-height: 2.75rem;
  padding: 0.7rem 0.25rem 0.2rem 0.3rem;
  font-size: 0.95rem;
  line-height: 1.2;
  border: 1px solid var(--page-border);
  border-left: 4px solid var(--page-border);
  border-radius: 3px;
  background: var(--page-surface);
  color: var(--page-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.wert {
  hyphens: auto;
  overflow-wrap: break-word;
  min-width: 0;
}
.symbol {
  position: absolute;
  top: 1px;
  left: 3px;
  white-space: nowrap;
  font-size: 0.65rem;
  line-height: 1;
  font-weight: 700;
  min-width: 1.3rem;
}
.art-ganz,
.art-komma {
  border-left-color: var(--zahl);
}
.art-ganz .symbol,
.art-komma .symbol {
  color: var(--zahl);
}
.art-ganz .wert,
.art-komma .wert {
  margin-left: auto;
}
.art-text {
  border-left-color: var(--text);
}
.art-text .symbol {
  color: var(--text);
}
.art-bool {
  border-left-color: var(--wahr);
}
.art-bool .symbol {
  color: var(--wahr);
}
.art-fehler {
  border-left-color: var(--fehler);
}
.art-fehler .wert {
  white-space: nowrap;
  font-size: 0.85rem;
}
.art-fehler .symbol,
.art-fehler .wert {
  color: var(--fehler);
  font-weight: 700;
}
.gewaehlt {
  outline: 3px solid var(--page-accent);
  outline-offset: 1px;
}
.markiert {
  border-style: dashed;
  border-color: var(--page-accent);
}
.neu {
  box-shadow: inset 0 0 0 2px var(--pfeil);
}
.legende {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  list-style: none;
  margin: 0.25rem 0 0;
  padding: 0;
  font-size: 0.9rem;
  color: var(--page-muted);
}
.symbol-legende {
  display: inline-block;
  min-width: 1.6rem;
  padding: 0 0.2rem;
  border-left: 4px solid currentColor;
  font-weight: 700;
  font-size: 0.75rem;
}
.legende .art-ganz .symbol-legende {
  color: var(--zahl);
}
.legende .art-text .symbol-legende {
  color: var(--text);
}
.legende .art-bool .symbol-legende {
  color: var(--wahr);
}
.legende .art-fehler .symbol-legende {
  color: var(--fehler);
}
.legende .art-neu .symbol-legende {
  color: var(--pfeil);
  border: 2px solid var(--pfeil);
}
.nur-vorlesen {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.pfeile {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.pfeile line {
  stroke: var(--pfeil);
  stroke-width: 2.5;
}
.pfeile line.fest {
  stroke-dasharray: 6 3;
}
.spitze {
  fill: var(--pfeil);
}
.dollar {
  fill: var(--pfeil);
  font-weight: 700;
  font-size: 14px;
}
</style>
