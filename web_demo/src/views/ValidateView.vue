<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TextHighlight from '../components/ui/TextHighlight.vue'
import { api } from '../data/api.js'
import '../styles/validate.css'

const router = useRouter()

// ── Load data from sessionStorage ──────────────────────────────
const originalText   = ref('')
const originalResult = ref(null)
const extractedJson  = ref({})
const spans          = ref([])

onMounted(async () => {
  const text   = sessionStorage.getItem('extractInput')
  const result = sessionStorage.getItem('extractResult')
  if (!text || !result) { router.push('/extract'); return }
  originalText.value   = text
  originalResult.value = JSON.parse(result)
  extractedJson.value  = JSON.parse(JSON.stringify(originalResult.value.extractedJson))
  spans.value          = originalResult.value.spans ?? []
  jsonText.value       = JSON.stringify(extractedJson.value, null, 2)
  await handleValidate()
})

// ── Module toggles ──────────────────────────────────────────────
const modules = [
  { key: 'event',  label: 'Event',                color: 'event'  },
  { key: 'geo',    label: 'Geographical Info',     color: 'geo'    },
  { key: 'impact', label: 'Impact',                color: 'impact' },
]
const activeModules = ref(['event', 'geo', 'impact'])
function toggleModule(key) {
  const idx = activeModules.value.indexOf(key)
  if (idx >= 0) activeModules.value.splice(idx, 1)
  else activeModules.value.push(key)
}

// ── JSON editor state ───────────────────────────────────────────
const jsonText    = ref('')
const isEditing   = ref(false)
const jsonError   = ref(false)

async function toggleEdit() {
  if (isEditing.value) {
    try {
      extractedJson.value = JSON.parse(jsonText.value)
      jsonError.value     = false
    } catch {
      jsonError.value = true
      return
    }
    isEditing.value = false
    await handleValidate()
  } else {
    jsonText.value  = JSON.stringify(extractedJson.value, null, 2)
    isEditing.value = true
  }
}

function copyJson() {
  navigator.clipboard.writeText(JSON.stringify(extractedJson.value, null, 2))
}

// ── Validation ──────────────────────────────────────────────────
const validationStatus = ref('idle')   // 'idle' | 'valid' | 'invalid'
const missingFields    = ref([])
const isValidating     = ref(false)

async function handleValidate() {
  isValidating.value = true
  try {
    const res = await api.validate(extractedJson.value)
    missingFields.value    = res.missing
    validationStatus.value = res.valid ? 'valid' : 'invalid'
  } finally {
    isValidating.value = false
  }
}

// ── Re-extract ──────────────────────────────────────────────────
const isReextracting = ref(false)
async function handleReextract() {
  isReextracting.value = true
  try {
    const result = await api.extract(originalText.value)
    extractedJson.value    = JSON.parse(JSON.stringify(result.extractedJson))
    spans.value            = result.spans ?? []
    jsonText.value         = JSON.stringify(extractedJson.value, null, 2)
    validationStatus.value = 'idle'
    isEditing.value        = false
    jsonError.value        = false
    sessionStorage.setItem('extractResult', JSON.stringify(result))
    await handleValidate()
  } finally {
    isReextracting.value = false
  }
}

// ── Revert ──────────────────────────────────────────────────────
async function handleRevert() {
  if (!originalResult.value) return
  extractedJson.value = JSON.parse(JSON.stringify(originalResult.value.extractedJson))
  spans.value         = originalResult.value.spans ?? []
  jsonText.value      = JSON.stringify(extractedJson.value, null, 2)
  isEditing.value     = false
  jsonError.value     = false
  await handleValidate()
}

// ── Approve & Append ────────────────────────────────────────────
const isAppending = ref(false)
async function handleApprove() {
  isAppending.value = true
  try {
    // Flatten extractedJson to the event schema used by dashboard
    const e = extractedJson.value
    const eventData = {
      year:     parseInt((e?.Event?.['Disaster Date (YMD)'] ?? '').slice(0, 4)) || null,
      date:     e?.Event?.['Disaster Date (YMD)'] ?? '',
      country:  e?.['Geographical Information']?.Country ?? '',
      group:    e?.Event?.['Disaster Group'] ?? '',
      type:     e?.Event?.['Disaster Type'] ?? '',
      cause:    e?.Event?.Cause ?? '',
      level0:   e?.['Geographical Information']?.['Geographical Level 0'] ?? '',
      level1:   e?.['Geographical Information']?.['Geographical Level 1'] ?? '',
      deaths:   e?.Effect?.['Number of Deaths'] ?? 0,
      affected: e?.Effect?.['Number of affected'] ?? 0,
      injured:  e?.Effect?.['Number of Injured'] ?? 0,
    }
    await api.addEvent(eventData)
    router.push('/dashboard')
  } finally {
    isAppending.value = false
  }
}
</script>

<template>
  <div class="validate-page">

    <!-- Toolbar -->
    <div class="validate-toolbar">
      <h1 class="validate-title">Validation — Review &amp; Edit Extract</h1>
    </div>

    <!-- Main panels -->
    <div class="validate-body">

      <!-- Left: original text -->
      <div class="panel-left">
        <div class="panel-header">
          <span>Original Text</span>
          <span class="panel-source">Source: input text</span>
        </div>
        <div class="panel-scroll">
          <TextHighlight
            :text="originalText"
            :spans="spans"
            :active-modules="activeModules"
          />
        </div>
        <!-- Legend + toggles -->
        <div class="panel-legend">
          <span class="legend-label">Highlight</span>
          <button
            v-for="m in modules"
            :key="m.key"
            :class="['mod-btn', `mod-btn--${m.color}`, activeModules.includes(m.key) ? 'on' : 'off']"
            @click="toggleModule(m.key)"
          >
            <i class="bi bi-circle-fill" style="font-size:0.5rem" />
            {{ m.label }}
          </button>
        </div>

      </div>

      <!-- Right: JSON -->
      <div class="panel-right">
        <div class="json-header">
          <span style="font-size:0.72rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted)">
            Structured JSON
          </span>
          <div class="json-header-right">
            <button
              class="btn btn-outline-secondary btn-sm"
              style="font-size:0.72rem;padding:2px 10px"
              @click="copyJson"
            >
              <i class="bi bi-clipboard me-1" />Copy
            </button>
            <button
              class="btn btn-sm"
              :class="isEditing ? 'btn-primary' : 'btn-outline-secondary'"
              style="font-size:0.72rem;padding:2px 10px"
              @click="toggleEdit"
            >
              <i :class="['bi', isEditing ? 'bi-check-lg' : 'bi-pencil', 'me-1']" />
              {{ isEditing ? 'Save' : 'Edit' }}
            </button>
          </div>
        </div>

        <!-- Validation status banner -->
        <div :class="['status-banner', isValidating ? 'status-banner--checking' : `status-banner--${validationStatus}`]">
          <template v-if="isValidating">
            <span class="spinner-border spinner-border-sm me-2" />
            <span>Validating…</span>
          </template>
          <template v-else-if="validationStatus === 'valid'">
            <i class="bi bi-check-circle-fill me-2" />
            <span>All required fields present — ready to append.</span>
          </template>
          <template v-else-if="validationStatus === 'invalid'">
            <i class="bi bi-exclamation-triangle-fill me-2" />
            <span><strong>{{ missingFields.length }} issue{{ missingFields.length > 1 ? 's' : '' }}:</strong> {{ missingFields.join(' · ') }}</span>
          </template>
          <template v-else>
            <i class="bi bi-hourglass me-2" style="opacity:0.5" />
            <span style="opacity:0.6">Waiting for validation…</span>
          </template>
        </div>

        <!-- JSON textarea -->
        <div class="json-scroll">
          <textarea
            v-model="jsonText"
            class="json-textarea"
            :readonly="!isEditing"
            :style="jsonError ? 'border-left: 3px solid var(--color-impact)' : ''"
            spellcheck="false"
          />
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div class="validate-footer">
      <div class="footer-actions">
        <div class="footer-left">
          <button
            class="btn btn-outline-secondary btn-sm"
            :disabled="isReextracting"
            @click="handleReextract"
          >
            <span v-if="isReextracting">
              <span class="spinner-border spinner-border-sm me-1" />Re-extracting…
            </span>
            <span v-else><i class="bi bi-arrow-repeat me-1" />Re-extract</span>
          </button>
          <button
            class="btn btn-outline-secondary btn-sm"
            @click="handleRevert"
          >
            <i class="bi bi-clock-history me-1" />Revert
          </button>
        </div>
        <div class="footer-right">
          <button
            v-if="validationStatus === 'valid'"
            class="btn btn-primary btn-sm px-4"
            :disabled="isAppending"
            @click="handleApprove"
          >
            <span v-if="isAppending">
              <span class="spinner-border spinner-border-sm me-1" />Appending…
            </span>
            <span v-else>
              <i class="bi bi-database-add me-1" />Append to Dashboard
            </span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>