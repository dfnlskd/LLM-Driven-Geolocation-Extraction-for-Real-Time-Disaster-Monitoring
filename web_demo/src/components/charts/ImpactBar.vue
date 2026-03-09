<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  events: { type: Array, default: () => [] },
})

const containerEl = ref(null)
const svgEl       = ref(null)
const tip = ref({ show: false, x: 0, y: 0, label: '', value: 0 })

const FIELDS = [
  { key: 'deaths',   label: 'Deaths'    },
  { key: 'missing',  label: 'Missing'   },
  { key: 'injured',  label: 'Injured'   },
  { key: 'affected', label: 'Affected'  },
  { key: 'damaged',  label: 'Damaged'   },
]

// Monochromatic shades within the project's blue-grey palette
const BAR_COLORS = ['#3a4268', '#475076', '#545e82', '#6e7a9e', '#8a94b5']

const M = { top: 20, right: 12, bottom: 36, left: 34 }

function draw() {
  if (!containerEl.value || !svgEl.value) return
  const W = containerEl.value.clientWidth
  const H = containerEl.value.clientHeight
  if (W < 10 || H < 10) return

  const data = FIELDS.map((f, i) => ({
    key:   f.key,
    label: f.label,
    color: BAR_COLORS[i],
    value: d3.sum(props.events, e => +e[f.key] || 0),
  }))

  const svg = d3.select(svgEl.value).attr('width', W).attr('height', H)

  const x = d3.scaleBand()
    .domain(data.map(d => d.key))
    .range([M.left, W - M.right])
    .padding(0.25)

  const minVal = Math.max(1, d3.min(data, d => d.value) || 1)
  const maxVal = d3.max(data, d => d.value) || 1

  // Log scale to handle large gaps between fields (e.g. Deaths vs Affected)
  const y = d3.scaleLog()
    .domain([Math.max(1, minVal * 0.5), maxVal * 1.2])
    .range([H - M.bottom, M.top])
    .clamp(true)

  // Grid lines
  svg.selectAll('g.grid').data([null]).join('g').attr('class', 'grid')
    .attr('transform', `translate(${M.left},0)`)
    .call(
      d3.axisLeft(y).ticks(4, '~s')
        .tickSize(-(W - M.left - M.right))
        .tickFormat(() => '')
    )
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('line').attr('stroke', '#e8ecf2').attr('stroke-dasharray', '2,3'))

  // Y axis (log ticks)
  svg.selectAll('g.y-axis').data([null]).join('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${M.left},0)`)
    .call(d3.axisLeft(y).ticks(4, '~s').tickSize(0))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('text').attr('font-size', '0.62rem').attr('fill', '#9eabbe').attr('dx', '-2'))

  const yFloor = H - M.bottom   // bottom of chart area (log scale has no 0)

  // Bars
  svg.selectAll('rect.bar')
    .data(data, d => d.key)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.key) ?? 0)
    .attr('y', d => d.value > 0 ? y(d.value) : yFloor)
    .attr('width', x.bandwidth())
    .attr('height', d => d.value > 0 ? Math.max(2, yFloor - y(d.value)) : 0)
    .attr('fill', d => d.color)
    .attr('rx', 3)
    .on('mousemove', (event, d) => {
      const [mx, my] = d3.pointer(event, containerEl.value)
      tip.value = { show: true, x: mx, y: my - 12, label: d.label, value: d.value }
    })
    .on('mouseleave', () => { tip.value.show = false })

  // Value labels above bars
  svg.selectAll('text.val-lbl')
    .data(data, d => d.key)
    .join('text')
    .attr('class', 'val-lbl')
    .attr('x', d => (x(d.key) ?? 0) + x.bandwidth() / 2)
    .attr('y', d => y(d.value) - 4)
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.63rem')
    .attr('fill', '#6b7a90')
    .attr('pointer-events', 'none')
    .text(d => d.value > 0 ? d3.format('~s')(d.value) : '')

  // X axis labels
  svg.selectAll('text.x-lbl')
    .data(data, d => d.key)
    .join('text')
    .attr('class', 'x-lbl')
    .attr('x', d => (x(d.key) ?? 0) + x.bandwidth() / 2)
    .attr('y', H - M.bottom + 14)
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.67rem')
    .attr('fill', '#9eabbe')
    .attr('pointer-events', 'none')
    .text(d => d.label)
}

let ro
onMounted(() => {
  draw()
  ro = new ResizeObserver(draw)
  ro.observe(containerEl.value)
})
onUnmounted(() => ro?.disconnect())
watch(() => props.events, draw)
</script>

<template>
  <div ref="containerEl" class="ib-wrap">
    <svg ref="svgEl" style="display:block" />
    <div
      v-if="tip.show"
      class="ib-tip"
      :style="{ left: tip.x + 'px', top: tip.y + 'px' }"
    >
      <div class="ib-tip-label">{{ tip.label }}</div>
      <strong>{{ tip.value.toLocaleString() }}</strong>
    </div>
  </div>
</template>

<style scoped>
.ib-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}
.ib-tip {
  position: absolute;
  pointer-events: none;
  transform: translateX(-50%);
  background: rgba(43,47,62,0.88);
  color: #fff;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 0.75rem;
  white-space: nowrap;
  text-align: center;
  line-height: 1.5;
}
.ib-tip-label { opacity: 0.75; font-size: 0.7rem; }
</style>
