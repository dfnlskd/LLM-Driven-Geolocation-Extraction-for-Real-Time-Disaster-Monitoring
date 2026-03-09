<script setup>
import { computed } from 'vue'

const props = defineProps({
  text:           { type: String,  required: true },
  spans:          { type: Array,   default: () => [] },
  activeModules:  { type: Array,   default: () => ['event', 'geo', 'impact'] },
})

/**
 * Split the plain text into an array of segments:
 * { text, module: 'event'|'geo'|'impact'|null, field }
 * Overlapping spans are resolved by taking the first match.
 */
const segments = computed(() => {
  const active = props.spans
    .filter(s => props.activeModules.includes(s.module))
    .sort((a, b) => a.start - b.start)

  const result = []
  let cursor = 0

  for (const span of active) {
    if (span.start < cursor) continue          // skip overlapping
    if (span.start > cursor) {
      result.push({ text: props.text.slice(cursor, span.start), module: null })
    }
    result.push({
      text:   props.text.slice(span.start, span.end),
      module: span.module,
      field:  span.field,
    })
    cursor = span.end
  }

  if (cursor < props.text.length) {
    result.push({ text: props.text.slice(cursor), module: null })
  }

  return result
})
</script>

<template>
  <div class="highlight-body">
    <template v-for="(seg, i) in segments" :key="i">
      <span
        v-if="seg.module"
        :class="['hl', `hl-${seg.module}`]"
        :title="seg.field"
      >{{ seg.text }}</span>
      <template v-else>{{ seg.text }}</template>
    </template>
  </div>
</template>

<style scoped>
.highlight-body {
  font-size: 0.875rem;
  line-height: 1.75;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}
.hl {
  border-radius: 3px;
  padding: 1px 2px;
  cursor: default;
}
.hl-event  { background: var(--highlight-event);  color: var(--color-event);  font-weight: 500; }
.hl-geo    { background: var(--highlight-geo);    color: var(--color-geo);    font-weight: 500; }
.hl-impact { background: var(--highlight-impact); color: var(--color-impact); font-weight: 500; }
</style>
