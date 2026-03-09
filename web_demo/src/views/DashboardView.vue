<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import WorldMap   from '../components/charts/WorldMap.vue'
import DonutChart from '../components/charts/DonutChart.vue'
import Timeline   from '../components/charts/Timeline.vue'
import ImpactBar  from '../components/charts/ImpactBar.vue'
import { api } from '../data/api.js'
import '../styles/dashboard.css'

const router = useRouter()
function goExtract() { router.push('/') }

// ── Data loading ──────────────────────────────────────────────────
const baseEvents      = ref([])
const pendingEvents   = ref([])
const confirmedEvents = ref([])
const loading         = ref(true)

onMounted(async () => {
  try {
    baseEvents.value    = await api.getEvents()
    pendingEvents.value = api.getAppendedEvents().map(e => ({ ...e, _pending: true }))
  } finally {
    loading.value = false
  }
})

function confirmPending() {
  confirmedEvents.value = [...confirmedEvents.value, ...pendingEvents.value]
  pendingEvents.value   = []
  localStorage.removeItem('appended_events')
}

function dismissPending(idx) {
  pendingEvents.value.splice(idx, 1)
  localStorage.setItem('appended_events', JSON.stringify(pendingEvents.value))
}

// All chart events = base + confirmed
const chartEvents = computed(() => [...baseEvents.value, ...confirmedEvents.value])

// ── Filter state ──────────────────────────────────────────────────
const selectedCountries = ref([])   // empty = All
const filterYearFrom    = ref(null)
const filterYearTo      = ref(null)
const filterGroup       = ref('')    // empty = All groups
const filterMetric      = ref('count')

const METRICS = [
  { value: 'count',    label: 'Event Count' },
  { value: 'deaths',   label: 'Deaths' },
  { value: 'missing',  label: 'Missing' },
  { value: 'injured',  label: 'Injured' },
  { value: 'affected', label: 'Affected' },
  { value: 'damaged',  label: 'Damaged Dwellings' },
]

const metricLabel = computed(() => METRICS.find(m => m.value === filterMetric.value)?.label ?? '')

// ── Filter options ────────────────────────────────────────────────
const allCountries = computed(() =>
  [...new Set(chartEvents.value.map(e => e.country).filter(Boolean))].sort()
)

const allGroups = computed(() =>
  [...new Set(chartEvents.value.map(e => e.group).filter(Boolean))].sort()
)

const yearRange = computed(() => {
  const ys = chartEvents.value.map(e => e.year).filter(Boolean)
  return ys.length ? [Math.min(...ys), Math.max(...ys)] : [1983, 2025]
})

const yearOptions = computed(() => {
  const [lo, hi] = yearRange.value
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
})

// Country dropdown state
const countryOpen   = ref(false)
const countrySearch = ref('')
const countryDropEl = ref(null)

const countrySearchResults = computed(() => {
  const q = countrySearch.value.toLowerCase()
  return q ? allCountries.value.filter(c => c.toLowerCase().includes(q)) : allCountries.value
})

function toggleCountry(c) {
  const idx = selectedCountries.value.indexOf(c)
  if (idx >= 0) selectedCountries.value.splice(idx, 1)
  else selectedCountries.value.push(c)
}

function onDocClick(e) {
  if (countryOpen.value && countryDropEl.value && !countryDropEl.value.contains(e.target)) {
    countryOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

// ── Filtered events ───────────────────────────────────────────────
const filtered = computed(() =>
  chartEvents.value.filter(e => {
    if (selectedCountries.value.length && !selectedCountries.value.includes(e.country)) return false
    if (filterYearFrom.value && e.year < filterYearFrom.value) return false
    if (filterYearTo.value   && e.year > filterYearTo.value)   return false
    if (filterGroup.value     && e.group !== filterGroup.value)  return false
    return true
  })
)

const hasFilter = computed(() =>
  selectedCountries.value.length || filterYearFrom.value || filterYearTo.value ||
  filterGroup.value || filterMetric.value !== 'count'
)

function clearFilters() {
  selectedCountries.value = []
  filterYearFrom.value    = null
  filterYearTo.value      = null
  filterGroup.value       = ''
  filterMetric.value      = 'count'
}

// ── Chart interaction handlers ────────────────────────────────────
function onSelectCountry(country) {
  toggleCountry(country)
}

function onSelectGroup(group) {
  filterGroup.value = filterGroup.value === group ? '' : group
}

function onSelectMetric(metric) {
  filterMetric.value = filterMetric.value === metric ? 'count' : metric
}

// ── KPIs & list ──────────────────────────────────────────────────
const totalEvents    = computed(() => filtered.value.length)
const totalCountries = computed(() => new Set(filtered.value.map(e => e.country).filter(Boolean)).size)

const listEvents = computed(() =>
  [...filtered.value].sort((a, b) => (b.year ?? 0) - (a.year ?? 0)).slice(0, 120)
)

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}
</script>

<template>
  <div class="dash-page">

    <!-- ── Filter bar ── -->
    <div class="dash-filterbar">

      <!-- Extract button — left side -->
      <button class="btn-extract" @click="goExtract">
        <i class="bi bi-arrow-left me-1" />Continue Extract
      </button>

      <!-- spacer pushes filters to right -->
      <div style="flex:1" />

      <!-- 1. Country multi-select -->
      <div class="filt-ctrl" ref="countryDropEl">
        <span class="filt-label">Country</span>
        <i class="bi bi-geo-alt filt-icon" />
        <button
          :class="['filt-btn', selectedCountries.length ? 'active' : '']"
          @click.stop="countryOpen = !countryOpen"
        >
          {{ selectedCountries.length ? `${selectedCountries.length} selected` : 'All' }}
          <i class="bi bi-chevron-down filt-chevron" />
        </button>
        <div v-if="countryOpen" class="filt-dropdown" @click.stop>
          <input
            v-model="countrySearch"
            class="filt-search"
            placeholder="Search country…"
            autofocus
          />
          <div class="filt-opts">
            <label class="filt-opt">
              <input
                type="checkbox"
                :checked="selectedCountries.length === 0"
                @change="selectedCountries = []"
              />
              <span>All Countries</span>
            </label>
            <label v-for="c in countrySearchResults" :key="c" class="filt-opt">
              <input
                type="checkbox"
                :checked="selectedCountries.includes(c)"
                @change="toggleCountry(c)"
              />
              <span>{{ c }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 2. Year range -->
      <div class="filt-ctrl filt-year">
        <span class="filt-label">Year</span>
        <i class="bi bi-calendar3 filt-icon" />
        <select v-model.number="filterYearFrom" class="filt-select">
          <option :value="null">From</option>
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
        <span class="filt-dash">–</span>
        <select v-model.number="filterYearTo" class="filt-select">
          <option :value="null">To</option>
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <!-- 3. Disaster Group -->
      <div class="filt-ctrl">
        <span class="filt-label">Group</span>
        <i class="bi bi-lightning filt-icon" />
        <select v-model="filterGroup" :class="['filt-select', filterGroup ? 'active' : '']">
          <option value="">All Groups</option>
          <option v-for="g in allGroups" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>

      <!-- 4. Display field (metric) -->
      <div class="filt-ctrl">
        <span class="filt-label">Show</span>
        <i class="bi bi-bar-chart filt-icon" />
        <select v-model="filterMetric" class="filt-select filt-select--metric">
          <option v-for="m in METRICS" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>

      <button v-if="hasFilter" class="btn-clear" @click="clearFilters">✕ Clear</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="dash-loading">
      <span class="spinner-border spinner-border-sm" />
      <span>Loading dataset…</span>
    </div>

    <div v-else class="dash-body">

      <!-- ── Left: KPI + Event list ── -->
      <div class="dash-left">

        <!-- KPI row — top 30% — two panel boxes side by side -->
        <div class="left-kpi-area">
          <div class="panel-card kpi-panel">
            <div class="panel-card-title">Affected Countries</div>
            <div class="kpi-body">
              <i class="bi bi-globe2 kpi-icon" />
              <div class="kpi-val">{{ fmt(totalCountries) }}</div>
            </div>
          </div>
          <div class="panel-card kpi-panel">
            <div class="panel-card-title">Total Events</div>
            <div class="kpi-body">
              <i class="bi bi-files kpi-icon" />
              <div class="kpi-val">{{ fmt(totalEvents) }}</div>
            </div>
          </div>
        </div>

        <!-- Event list — bottom 70% — one panel box -->
        <div class="panel-card left-list-panel">
          <div class="panel-card-title">
            Recent Events
            <span class="panel-title-sub">{{ fmt(totalEvents) }} total</span>
          </div>
          <div class="left-list-inner">
            <div v-if="pendingEvents.length" class="pending-section">
              <div class="pending-header">
                <span class="pending-label">
                  <i class="bi bi-clock-history me-1" />Pending ({{ pendingEvents.length }})
                </span>
                <button class="btn-confirm" @click="confirmPending">
                  <i class="bi bi-check-lg me-1" />Confirm All
                </button>
              </div>
              <div v-for="(ev, i) in pendingEvents" :key="i" class="event-row event-row--pending">
                <div class="er-main">
                  <span class="er-country">{{ ev.country || '—' }}</span>
                  <span class="er-dot">·</span>
                  <span class="er-type">{{ ev.type || ev.group || '—' }}</span>
                </div>
                <div class="er-meta">
                  <span class="er-year">{{ ev.year || '—' }}</span>
                  <button class="er-dismiss" @click="dismissPending(i)"><i class="bi bi-x" /></button>
                </div>
              </div>
            </div>
            <div class="event-list">
              <div
                v-for="ev in listEvents"
                :key="ev.id ?? (ev.country + ev.date)"
                class="event-row"
              >
                <div class="er-main">
                  <span class="er-country">{{ ev.country || '—' }}</span>
                  <span class="er-dot">·</span>
                  <span class="er-type">{{ ev.type || ev.group || '—' }}</span>
                </div>
                <span class="er-year">{{ ev.year || '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Middle: Map + Timeline ── -->
      <div class="dash-mid">
        <div class="panel-card map-card">
          <div class="panel-card-title">Geographic Distribution — {{ metricLabel }}</div>
          <WorldMap
            :events="filtered"
            :metric="filterMetric"
            :selectedCountries="selectedCountries"
            @select-country="onSelectCountry"
          />
        </div>
        <div class="panel-card">
          <div class="panel-card-title">{{ metricLabel }} by Year</div>
          <Timeline :events="filtered" :metric="filterMetric" />
        </div>
      </div>

      <!-- ── Right: Donut + ImpactBar ── -->
      <div class="dash-right">
        <div class="panel-card">
          <div class="panel-card-title">By Disaster Group</div>
          <DonutChart
            :events="filtered"
            :selectedGroup="filterGroup"
            @select-group="onSelectGroup"
          />
        </div>
        <div class="panel-card">
          <div class="panel-card-title">Impact Summary</div>
          <ImpactBar
            :events="filtered"
            :selectedMetric="filterMetric"
            @select-metric="onSelectMetric"
          />
        </div>
      </div>

    </div>
  </div>
</template>
