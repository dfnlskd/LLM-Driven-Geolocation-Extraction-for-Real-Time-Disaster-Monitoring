<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  events:        { type: Array,  default: () => [] },
  selectedGroup: { type: String, default: '' },
})

const emit = defineEmits(['select-group'])

const containerEl  = ref(null)
const svgEl        = ref(null)
const legendItems  = ref([])
const tip = ref({ show: false, x: 0, y: 0, label: '', value: 0, pct: '' })

const GROUP_COLORS = {
  'Hydrological':           '#4a7fb5',
  'Meteorological':         '#5aaa7a',
  'Geophysical':            '#e07b39',
  'Biological':             '#9b59b6',
  'Climatological':         '#16a085',
  'Industrial accident':    '#e74c3c',
  'Transport':              '#f39c12',
  'Miscellaneous accident': '#95a5a6',
}
function color(group) { return GROUP_COLORS[group] || '#b0b8c8' }

function draw() {
  if (!containerEl.value || !svgEl.value) return
  const W = containerEl.value.clientWidth
  const size = Math.min(W, 160)
  const cx = W / 2
  const cy = size / 2
  const outerR = size / 2 - 10
  const innerR = outerR * 0.56

  const grouped = d3.rollup(props.events, v => v.length, d => d.group || 'Unknown')
  const data = Array.from(grouped, ([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value)

  const total = d3.sum(data, d => d.value)
  legendItems.value = data.map(d => ({ label: d.key, color: color(d.key), value: d.value }))
  if (!data.length) return

  const pie   = d3.pie().value(d => /** @type {any} */(d).value).sort(null)
  const arc   = d3.arc().innerRadius(innerR).outerRadius(outerR)
  const arcHv = d3.arc().innerRadius(innerR).outerRadius(outerR + 4)

  const svg = d3.select(svgEl.value).attr('width', W).attr('height', size)

  const g = svg.selectAll('g.donut-g').data([null]).join('g')
    .attr('class', 'donut-g')
    .attr('transform', `translate(${cx},${cy})`)

  g.selectAll('path')
    .data(pie(data), d => d.data.key)
    .join('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data.key))
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .attr('opacity', d => props.selectedGroup && d.data.key !== props.selectedGroup ? 0.3 : 1)
    .style('cursor', 'pointer')
    .on('click', (_, d) => {
      const groupName = /** @type {any} */(d.data).key
      emit('select-group', groupName)
    })
    .on('mouseenter', function(event, d) {
      d3.select(this).attr('d', arcHv(d))
      const [mx, my] = d3.pointer(event, containerEl.value)
      const dd = /** @type {any} */(d.data)
      tip.value = {
        show: true, x: mx, y: my - 10,
        label: dd.key,
        value: dd.value,
        pct: ((dd.value / total) * 100).toFixed(1) + '%',
      }
    })
    .on('mousemove', function(event) {
      const [mx, my] = d3.pointer(event, containerEl.value)
      tip.value = { ...tip.value, x: mx, y: my - 10 }
    })
    .on('mouseleave', function(_, d) {
      d3.select(this).attr('d', arc(d))
      tip.value.show = false
    })

  svg.selectAll('text.ct-num').data([total]).join('text').attr('class', 'ct-num')
    .attr('x', cx).attr('y', cy).attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .attr('font-size', '1.1rem').attr('font-weight', '700').attr('fill', '#2b2f3e')
    .text(total)
}

let ro
onMounted(() => { draw(); ro = new ResizeObserver(draw); ro.observe(containerEl.value) })
onUnmounted(() => ro?.disconnect())
watch([() => props.events, () => props.selectedGroup], draw)
</script>

<template>
  <div class="dn-wrap">
    <div ref="containerEl" class="dn-chart-area">
      <svg ref="svgEl" style="display:block" />
      <div
        v-if="tip.show"
        class="dn-tip"
        :style="{ left: tip.x + 'px', top: tip.y + 'px' }"
      >
        <div class="dn-tip-label">{{ tip.label }}</div>
        <div><strong>{{ tip.value.toLocaleString() }}</strong> <span class="dn-tip-pct">{{ tip.pct }}</span></div>
      </div>
    </div>
    <div class="legend">
      <div
        v-for="item in legendItems"
        :key="item.label"
        class="legend-row"
        :class="{ 'legend-row--active': selectedGroup === item.label, 'legend-row--dimmed': selectedGroup && selectedGroup !== item.label }"
        style="cursor:pointer"
        @click="$emit('select-group', item.label)"
      >
        <span class="ldot" :style="{ background: item.color }" />
        <span class="lname">{{ item.label }}</span>
        <span class="lval">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dn-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.dn-chart-area {
  position: relative;
  flex-shrink: 0;
}
.dn-tip {
  position: absolute;
  pointer-events: none;
  transform: translateX(-50%);
  background: rgba(43,47,62,0.88);
  color: #fff;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.75rem;
  white-space: nowrap;
  line-height: 1.5;
  z-index: 10;
}
.dn-tip-label { font-weight: 600; }
.dn-tip-pct   { opacity: 0.7; font-size: 0.7rem; }

.legend {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-top: 1px solid var(--border);
}
.legend-row { display: flex; align-items: center; gap: 7px; font-size: 0.74rem; border-radius: 4px; padding: 1px 4px; transition: opacity 0.15s; }
.legend-row:hover { background: rgba(84,94,130,0.08); }
.legend-row--active { background: rgba(245,166,35,0.12); }
.legend-row--dimmed { opacity: 0.35; }
.ldot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.lname { flex: 1; color: var(--text-secondary); }
.lval  { font-weight: 600; color: var(--text-primary); min-width: 28px; text-align: right; }
</style>
