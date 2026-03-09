<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  events: { type: Array, default: () => [] },
  metric: { type: String, default: 'count' },
})

const containerEl = ref(null)
const svgEl       = ref(null)
const tip = ref({ show: false, x: 0, y: 0, year: 0, total: 0, yearly: 0 })

const M = { top: 12, right: 16, bottom: 30, left: 46 }

function metricVal(ev) {
  if (props.metric === 'count')    return 1
  if (props.metric === 'deaths')   return ev.deaths   || 0
  if (props.metric === 'missing')  return ev.missing  || 0
  if (props.metric === 'injured')  return ev.injured  || 0
  if (props.metric === 'affected') return ev.affected || 0
  if (props.metric === 'damaged')  return ev.damaged  || 0
  return 1
}

function draw() {
  if (!containerEl.value || !svgEl.value) return
  const W = containerEl.value.clientWidth
  const H = 170
  if (W < 10) return

  const yearCounts = d3.rollup(props.events, v => d3.sum(v, metricVal), d => d.year)
  const yearly = Array.from(yearCounts, ([year, count]) => ({ year: +year, count }))
    .filter(d => d.year >= 1980 && d.year <= 2026)
    .sort((a, b) => a.year - b.year)

  // Build cumulative series
  let running = 0
  const data = yearly.map(d => {
    running += d.count
    return { year: d.year, yearly: d.count, total: running }
  })

  const svg = d3.select(svgEl.value).attr('width', W).attr('height', H)

  if (!data.length) { svg.selectAll('*').remove(); return }

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([M.left, W - M.right])

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.total) ?? 0])
    .range([H - M.bottom, M.top])
    .nice()

  // Grid lines
  svg.selectAll('g.grid').data([null]).join('g').attr('class', 'grid')
    .attr('transform', `translate(${M.left},0)`)
    .call(
      d3.axisLeft(y).ticks(4)
        .tickSize(-(W - M.left - M.right))
        .tickFormat(() => '')
    )
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('line').attr('stroke', '#e8ecf2').attr('stroke-dasharray', '2,3'))

  // Area fill
  const area = d3.area()
    .x(d => x(d.year))
    .y0(H - M.bottom)
    .y1(d => y(d.total))
    .curve(d3.curveMonotoneX)

  svg.selectAll('path.tl-area').data([data]).join('path')
    .attr('class', 'tl-area')
    .attr('d', area)
    .attr('fill', '#545e82')
    .attr('opacity', 0.15)

  // Line
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.total))
    .curve(d3.curveMonotoneX)

  svg.selectAll('path.tl-line').data([data]).join('path')
    .attr('class', 'tl-line')
    .attr('d', line)
    .attr('fill', 'none')
    .attr('stroke', '#545e82')
    .attr('stroke-width', 2)

  // Invisible hit-area bars for hover
  const bw = Math.max(4, (W - M.left - M.right) / data.length - 1)
  svg.selectAll('rect.hit').data(data, d => d.year)
    .join('rect')
    .attr('class', 'hit')
    .attr('x', d => x(d.year) - bw / 2)
    .attr('y', M.top)
    .attr('width', bw)
    .attr('height', H - M.top - M.bottom)
    .attr('fill', 'transparent')
    .on('mousemove', (_, d) => {
      tip.value = { show: true, x: x(d.year), y: y(d.total) - 8, year: d.year, total: d.total, yearly: d.yearly }
    })
    .on('mouseleave', () => { tip.value.show = false })

  // Dot on hover point
  svg.selectAll('circle.tl-dot').data(tip.value.show ? [data.find(d => d.year === tip.value.year)].filter(Boolean) : [])
    .join('circle')
    .attr('class', 'tl-dot')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.total))
    .attr('r', 4)
    .attr('fill', '#545e82')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .attr('pointer-events', 'none')

  // X axis
  const step = Math.max(1, Math.ceil(data.length / 12))
  svg.selectAll('g.x-axis').data([null]).join('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${H - M.bottom})`)
    .call(
      d3.axisBottom(x)
        .tickValues(data.filter((_, i) => i % step === 0).map(d => d.year))
        .tickFormat(d3.format('d'))
        .tickSize(3)
    )
    .call(g => g.select('.domain').attr('stroke', '#e2e8f0'))
    .call(g => g.selectAll('text').attr('font-size', '0.67rem').attr('fill', '#9eabbe'))

  // Y axis
  svg.selectAll('g.y-axis').data([null]).join('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${M.left},0)`)
    .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('~s')).tickSize(0))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('text').attr('font-size', '0.67rem').attr('fill', '#9eabbe').attr('dx', '-3'))
}

let ro
onMounted(() => { draw(); ro = new ResizeObserver(draw); ro.observe(containerEl.value) })
onUnmounted(() => ro?.disconnect())
watch([() => props.events, () => props.metric], draw)
</script>

<template>
  <div ref="containerEl" style="position:relative">
    <svg ref="svgEl" style="display:block;width:100%" />
    <div
      v-if="tip.show"
      class="tl-tip"
      :style="{ left: tip.x + 'px', top: tip.y + 'px' }"
    >
      <div class="tl-tip-year">{{ tip.year }}</div>
      <div class="tl-tip-row">Cumulative <strong>{{ tip.total.toLocaleString() }}</strong></div>
      <div class="tl-tip-row tl-tip-muted">This year +{{ tip.yearly.toLocaleString() }}</div>
    </div>
  </div>
</template>

<style scoped>
.tl-tip {
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
}
.tl-tip-year { font-weight: 700; margin-bottom: 1px; }
.tl-tip-muted { opacity: 0.65; font-size: 0.7rem; }
</style>
