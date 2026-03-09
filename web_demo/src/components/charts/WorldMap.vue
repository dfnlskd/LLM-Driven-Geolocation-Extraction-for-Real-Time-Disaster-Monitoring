<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import worldData from 'world-atlas/countries-110m.json'
import { iso3ToNum } from '../../data/iso3ToNum.js'

const props = defineProps({
  events:            { type: Array,  default: () => [] },
  metric:            { type: String, default: 'count' },
  selectedCountries: { type: Array,  default: () => [] },
})

const emit = defineEmits(['select-country'])

const containerEl = ref(null)
const svgEl       = ref(null)
const tip = ref({ show: false, x: 0, y: 0, name: '', value: 0 })

const geoCountries = feature(worldData, worldData.objects.countries)

const METRIC_UNIT = {
  count: 'event', deaths: 'death', missing: 'missing', injured: 'injured',
  affected: 'affected', damaged: 'damaged',
}

function metricVal(ev) {
  if (props.metric === 'count')    return 1
  if (props.metric === 'deaths')   return ev.deaths   || 0
  if (props.metric === 'missing')  return ev.missing  || 0
  if (props.metric === 'injured')  return ev.injured  || 0
  if (props.metric === 'affected') return ev.affected || 0
  if (props.metric === 'damaged')  return ev.damaged  || 0
  return 1
}

// Zoom state — persists across redraws
let zoomBehavior = null
let currentTransform = d3.zoomIdentity

function draw() {
  if (!containerEl.value || !svgEl.value) return
  const W = containerEl.value.clientWidth
  const H = containerEl.value.clientHeight
  if (W < 10 || H < 10) return

  const valueByNum = new Map()
  const nameByNum  = new Map()
  for (const ev of props.events) {
    if (!ev.iso3) continue
    const num = iso3ToNum[ev.iso3]
    if (!num) continue
    valueByNum.set(num, (valueByNum.get(num) || 0) + metricVal(ev))
    if (!nameByNum.has(num) && ev.country) nameByNum.set(num, ev.country)
  }

  // Build set of selected numeric IDs for highlight
  const selectedNums = new Set()
  for (const [num, name] of nameByNum) {
    if (props.selectedCountries.includes(name)) selectedNums.add(num)
  }

  const maxVal = d3.max([...valueByNum.values()]) || 1
  // Log scale for vivid contrast; original blue-grey hue kept
  const colorScale = d3.scaleSequentialLog(
    [1, Math.max(2, maxVal)],
    d3.interpolate('#dce4f0', '#2d3a6b')
  )

  const projection = d3.geoNaturalEarth1().fitSize([W, H], geoCountries)
  const pathGen    = d3.geoPath(projection)

  const svg = d3.select(svgEl.value).attr('width', W).attr('height', H)

  // Ensure map group exists
  let mapG = svg.select('g.map-g')
  if (mapG.empty()) mapG = svg.append('g').attr('class', 'map-g')

  mapG.selectAll('path.country')
    .data(geoCountries.features, d => d.id)
    .join('path')
    .attr('class', 'country')
    .attr('d', pathGen)
    .attr('fill', d => valueByNum.has(d.id) ? colorScale(valueByNum.get(d.id)) : '#e8ecf2')
    .attr('stroke', d => selectedNums.has(d.id) ? '#f5a623' : '#fff')
    .attr('stroke-width', d => selectedNums.has(d.id) ? 2 : 0.4)
    .style('cursor', d => nameByNum.has(d.id) ? 'pointer' : 'default')
    .on('click', (_, d) => {
      const name = nameByNum.get(d.id)
      if (name) emit('select-country', name)
    })
    .on('mousemove', (event, d) => {
      const value = valueByNum.get(d.id)
      if (!value) { tip.value.show = false; return }
      tip.value = {
        show: true,
        x: event.offsetX + 14,
        y: event.offsetY - 10,
        name:  nameByNum.get(d.id) || d.id,
        value,
      }
    })
    .on('mouseleave', () => { tip.value.show = false })

  // Apply current zoom transform to restore state after redraw
  mapG.attr('transform', currentTransform.toString())

  // Set up zoom behavior once
  if (!zoomBehavior) {
    zoomBehavior = d3.zoom()
      .scaleExtent([1, 12])
      .on('zoom', (event) => {
        currentTransform = event.transform
        mapG.attr('transform', currentTransform.toString())
        tip.value.show = false
      })
    svg.call(zoomBehavior)
    // Prevent double-click zoom (we have our own reset)
    svg.on('dblclick.zoom', null)
  }
}

function resetZoom() {
  if (!svgEl.value || !zoomBehavior) return
  currentTransform = d3.zoomIdentity
  d3.select(svgEl.value)
    .transition().duration(400)
    .call(zoomBehavior.transform, d3.zoomIdentity)
}

let ro
onMounted(() => {
  draw()
  ro = new ResizeObserver(draw)
  ro.observe(containerEl.value)
})
onUnmounted(() => ro?.disconnect())
watch([() => props.events, () => props.metric, () => props.selectedCountries], draw)
</script>

<template>
  <div ref="containerEl" class="map-wrap">
    <svg ref="svgEl" style="display:block" />
    <button class="map-reset-btn" title="Reset zoom" @click="resetZoom">
      <i class="bi bi-arrows-fullscreen" />
    </button>
    <div v-if="tip.show" class="map-tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }">
      <div class="tip-name">{{ tip.name }}</div>
      <div class="tip-count">
        {{ tip.value.toLocaleString() }}
        {{ METRIC_UNIT[metric] }}{{ tip.value !== 1 ? 's' : '' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-wrap { position: relative; width: 100%; height: 100%; overflow: hidden; }
.map-wrap svg { cursor: grab; }
.map-wrap svg:active { cursor: grabbing; }

.map-reset-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.85);
  border: 1px solid #d0d7e3;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #545e82;
  transition: background 0.15s;
}
.map-reset-btn:hover { background: #fff; color: #3a4268; }

.map-tip {
  position: absolute;
  pointer-events: none;
  background: rgba(43,47,62,0.88);
  color: #fff;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 0.78rem;
  line-height: 1.5;
  white-space: nowrap;
}
.tip-name  { font-weight: 600; }
.tip-count { opacity: 0.8; }
</style>
