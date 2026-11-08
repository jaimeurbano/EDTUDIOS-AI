<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 18 },
  strokeWidth: { type: [Number, String], default: 1.8 },
})

const ICONS = {
  home: [
    { t: 'path', d: 'M3 10.5 12 3l9 7.5' },
    { t: 'path', d: 'M5 9.5V21h14V9.5' },
    { t: 'path', d: 'M9.5 21v-6h5v6' },
  ],
  target: [
    { t: 'circle', cx: 12, cy: 12, r: 9 },
    { t: 'circle', cx: 12, cy: 12, r: 5 },
    { t: 'circle', cx: 12, cy: 12, r: 1 },
  ],
  lab: [
    { t: 'path', d: 'M9 3h6' },
    { t: 'path', d: 'M10 3v6l-5.4 9.4A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.6L14 9V3' },
    { t: 'path', d: 'M7.5 15h9' },
  ],
  chart: [
    { t: 'path', d: 'M4 20V10' },
    { t: 'path', d: 'M10 20V4' },
    { t: 'path', d: 'M16 20v-7' },
    { t: 'path', d: 'M22 20H2' },
  ],
  chat: [
    { t: 'path', d: 'M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z' },
  ],
  settings: [
    { t: 'circle', cx: 12, cy: 12, r: 3 },
    { t: 'path', d: 'M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1' },
  ],
  flame: [
    {
      t: 'path',
      d: 'M12 22c4.1 0 7-2.8 7-6.6 0-3-1.9-5.4-4.1-7.6-.5 2-1.5 3.1-2.9 4.1 0-3-1.4-5.6-3-7.9C8 7.7 5 10.5 5 15.4 5 19.2 7.9 22 12 22z',
    },
  ],
  bolt: [{ t: 'path', d: 'M13 2 4 14h6l-1 8 9-12h-6l1-8z' }],
  star: [
    { t: 'path', d: 'm12 3 2.7 5.6 6.2.9-4.5 4.4 1.1 6.1-5.5-2.9L6.5 20l1.1-6.1L3.1 9.5l6.2-.9L12 3z' },
  ],
  trophy: [
    { t: 'path', d: 'M8 4h8v5a4 4 0 0 1-8 0V4z' },
    { t: 'path', d: 'M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3' },
    { t: 'path', d: 'M12 13v5M9 21h6M10 18h4' },
  ],
  spark: [
    { t: 'path', d: 'M12 3v4M12 17v4M3 12h4M17 12h4' },
    { t: 'path', d: 'm5.6 5.6 2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8' },
  ],
  brain: [
    { t: 'path', d: 'M9.5 4a2.5 2.5 0 0 0-2.5 2.5c0 .4.1.8.3 1.1A2.8 2.8 0 0 0 5 10.4c0 1 .5 1.9 1.3 2.4A2.8 2.8 0 0 0 7.8 18c.4.7 1.2 1.2 2.1 1.2H12V4H9.5z' },
    { t: 'path', d: 'M14.5 4A2.5 2.5 0 0 1 17 6.5c0 .4-.1.8-.3 1.1a2.8 2.8 0 0 1 2.3 2.8c0 1-.5 1.9-1.3 2.4a2.8 2.8 0 0 1-1.5 5.2c-.4.7-1.2 1.2-2.1 1.2H12V4h2.5z' },
  ],
  calendar: [
    { t: 'rect', x: 3, y: 5, width: 18, height: 16, rx: 2 },
    { t: 'path', d: 'M16 3v4M8 3v4M3 11h18' },
  ],
  layers: [
    { t: 'path', d: 'm12 2 9 5-9 5-9-5 9-5z' },
    { t: 'path', d: 'm3 12 9 5 9-5' },
    { t: 'path', d: 'm3 17 9 5 9-5' },
  ],
  compass: [
    { t: 'circle', cx: 12, cy: 12, r: 9 },
    { t: 'path', d: 'm15.5 8.5-2.1 5-5 2.1 2.1-5 5-2.1z' },
  ],
  check: [{ t: 'path', d: 'M20 6 9 17l-5-5' }],
  x: [{ t: 'path', d: 'M18 6 6 18M6 6l12 12' }],
  'arrow-right': [
    { t: 'path', d: 'M5 12h14' },
    { t: 'path', d: 'm13 6 6 6-6 6' },
  ],
  'arrow-left': [
    { t: 'path', d: 'M19 12H5' },
    { t: 'path', d: 'm11 18-6-6 6-6' },
  ],
  lightbulb: [
    { t: 'path', d: 'M9 18h6M10 21h4' },
    { t: 'path', d: 'M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9V16h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3z' },
  ],
  send: [
    { t: 'path', d: 'm22 2-7 20-4-9-9-4 20-7z' },
    { t: 'path', d: 'M22 2 11 13' },
  ],
  mic: [
    { t: 'rect', x: 9, y: 2, width: 6, height: 12, rx: 3 },
    { t: 'path', d: 'M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8' },
  ],
  volume: [
    { t: 'path', d: 'M11 5 6 9H3v6h3l5 4V5z' },
    { t: 'path', d: 'M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14' },
  ],
  trash: [
    { t: 'path', d: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5' },
  ],
  copy: [
    { t: 'rect', x: 9, y: 9, width: 13, height: 13, rx: 2 },
    { t: 'path', d: 'M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1' },
  ],
  play: [{ t: 'path', d: 'm8 5 11 7-11 7V5z' }],
  rotate: [
    { t: 'path', d: 'M21 12a9 9 0 1 1-3-6.7' },
    { t: 'path', d: 'M21 3v6h-6' },
  ],
  lock: [
    { t: 'rect', x: 4, y: 11, width: 16, height: 10, rx: 2 },
    { t: 'path', d: 'M8 11V7a4 4 0 0 1 8 0v4' },
  ],
  menu: [{ t: 'path', d: 'M4 6h16M4 12h16M4 18h16' }],
  clock: [
    { t: 'circle', cx: 12, cy: 12, r: 9 },
    { t: 'path', d: 'M12 7v5l3 2' },
  ],
  book: [
    { t: 'path', d: 'M4 4h7a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4V4z' },
    { t: 'path', d: 'M20 4h-7a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h7V4z' },
  ],
  code: [
    { t: 'path', d: 'm8 6-6 6 6 6' },
    { t: 'path', d: 'm16 6 6 6-6 6' },
  ],
  download: [
    { t: 'path', d: 'M12 3v12M7 10l5 5 5-5M4 21h16' },
  ],
  upload: [
    { t: 'path', d: 'M12 21V9M7 14l5-5 5 5M4 3h16' },
  ],
  alert: [
    { t: 'path', d: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z' },
    { t: 'path', d: 'M12 9v4M12 17h.01' },
  ],
  info: [
    { t: 'circle', cx: 12, cy: 12, r: 9 },
    { t: 'path', d: 'M12 11v5M12 8h.01' },
  ],
  user: [
    { t: 'circle', cx: 12, cy: 8, r: 4 },
    { t: 'path', d: 'M4 21a8 8 0 0 1 16 0' },
  ],
  external: [
    { t: 'path', d: 'M14 3h7v7M10 14 21 3' },
    { t: 'path', d: 'M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5' },
  ],
  eye: [
    { t: 'path', d: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z' },
    { t: 'circle', cx: 12, cy: 12, r: 3 },
  ],
  'chevron-down': [{ t: 'path', d: 'm6 9 6 6 6-6' }],
  'chevron-right': [{ t: 'path', d: 'm9 6 6 6-6 6' }],
  grid: [
    { t: 'rect', x: 3, y: 3, width: 7, height: 7, rx: 1.5 },
    { t: 'rect', x: 14, y: 3, width: 7, height: 7, rx: 1.5 },
    { t: 'rect', x: 3, y: 14, width: 7, height: 7, rx: 1.5 },
    { t: 'rect', x: 14, y: 14, width: 7, height: 7, rx: 1.5 },
  ],
  js: [
    { t: 'rect', x: 3, y: 3, width: 18, height: 18, rx: 4 },
    { t: 'path', d: 'M10 9v5a2 2 0 0 1-3.5 1.3' },
    { t: 'path', d: 'M17 10.5c-.4-.9-1.2-1.4-2-1.4-1.1 0-1.8.7-1.8 1.6 0 1 .8 1.4 1.9 1.8 1.2.4 2 .9 2 2 0 1.1-.9 1.9-2.1 1.9-1 0-1.9-.5-2.3-1.4' },
  ],
  vue: [
    { t: 'path', d: 'M3 4h5l4 7 4-7h5l-9 16L3 4z' },
    { t: 'path', d: 'M8 4h4l-2 3.5L8 4z' },
  ],
  css: [
    { t: 'path', d: 'M4 3h16l-1.5 15L12 21l-6.5-3L4 3z' },
    { t: 'path', d: 'M8 8h8l-.3 3.5H9l.3 3L12 15.5l2.7-1 .2-2' },
  ],
  plus: [{ t: 'path', d: 'M12 5v14M5 12h14' }],
  minus: [{ t: 'path', d: 'M5 12h14' }],
  refresh: [
    { t: 'path', d: 'M3 12a9 9 0 0 1 15.3-6.4L21 8' },
    { t: 'path', d: 'M21 3v5h-5' },
    { t: 'path', d: 'M21 12a9 9 0 0 1-15.3 6.4L3 16' },
    { t: 'path', d: 'M3 21v-5h5' },
  ],
  shield: [
    { t: 'path', d: 'M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6l-8-3z' },
    { t: 'path', d: 'm9 12 2 2 4-4' },
  ],
  wand: [
    { t: 'path', d: 'm15 4 5 5L7 22H2v-5L15 4z' },
    { t: 'path', d: 'm14 5 5 5M6 2v3M4.5 3.5h3M19 15v3M17.5 16.5h3' },
  ],
  flag: [
    { t: 'path', d: 'M5 21V4M5 4h11l-1.5 3L16 10H5' },
  ],
  dot: [{ t: 'circle', cx: 12, cy: 12, r: 4 }],
}

const shapes = computed(() => ICONS[props.name] || ICONS.dot)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="icon-svg"
  >
    <template v-for="(shape, index) in shapes" :key="index">
      <path v-if="shape.t === 'path'" :d="shape.d" />
      <circle
        v-else-if="shape.t === 'circle'"
        :cx="shape.cx"
        :cy="shape.cy"
        :r="shape.r"
      />
      <rect
        v-else-if="shape.t === 'rect'"
        :x="shape.x"
        :y="shape.y"
        :width="shape.width"
        :height="shape.height"
        :rx="shape.rx"
      />
    </template>
  </svg>
</template>

<style scoped>
.icon-svg {
  flex: none;
}
</style>
