<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ExampleCard from '../components/ui/ExampleCard.vue'
import { EXAMPLES } from '../mock/extractResult.js'
import { api } from '../data/api.js'
import '../styles/extract.css'

const router      = useRouter()
const inputText   = ref('')
const isLoading   = ref(false)
const activeId    = ref(null)
const textareaRef = ref(null)

const cardExamples = EXAMPLES

function selectExample(ex) {
  activeId.value  = ex.id
  inputText.value = ex.text
  textareaRef.value?.focus()
}

async function handleExtract() {
  if (!inputText.value.trim()) return
  isLoading.value = true
  try {
    const result = await api.extract(inputText.value)
    sessionStorage.setItem('extractInput',  inputText.value)
    sessionStorage.setItem('extractResult', JSON.stringify(result))
    router.push('/validate')
  } finally {
    isLoading.value = false
  }
}

function handleClear() {
  inputText.value = ''
  activeId.value  = null
  textareaRef.value?.focus()
}

function onKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleExtract()
}

const steps = [
  {
    num: '01',
    icon: 'bi-file-text',
    title: 'Input Disaster Text',
    desc: 'Paste any unstructured disaster report — news articles, situation reports, ReliefWeb dispatches.',
  },
  {
    num: '02',
    icon: 'bi-cpu',
    title: 'Schema-Guided Extraction',
    desc: 'A two-stage LLM pipeline with RAG detects fields then extracts values aligned to the disaster schema.',
  },
  {
    num: '03',
    icon: 'bi-map',
    title: 'Validate & Explore',
    desc: 'Review highlighted results, edit if needed, then append to the live dashboard for spatial analysis.',
  },
]
</script>

<template>
  <div class="extract-page">

    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">
          Transform unstructured disaster reports<br>into structured intelligence
        </h1>
        <p class="hero-sub">
          Paste any disaster narrative. Extract GIS-ready structured data in seconds.
        </p>
      </div>
    </section>

    <!-- Input section -->
    <section class="input-section">
      <div class="container" style="max-width: 920px">

        <p class="input-card-label">Try an example</p>
        <div class="examples-grid">
          <ExampleCard
            v-for="ex in cardExamples"
            :key="ex.id"
            :example="ex"
            :active="activeId === ex.id"
            @select="selectExample"
          />
        </div>

        <p class="input-card-label mt-4">Input text</p>
        <textarea
          ref="textareaRef"
          v-model="inputText"
          class="extract-textarea"
          placeholder="Paste a disaster report here, or click an example above…"
          rows="5"
          @keydown="onKeydown"
        />

        <div class="action-row">
          <span class="action-tip">
            Tip: Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to extract
          </span>
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-secondary btn-sm"
              :disabled="isLoading"
              @click="handleClear"
            >
              Clear
            </button>
            <button
              class="btn btn-primary btn-sm px-4"
              :disabled="!inputText.trim() || isLoading"
              @click="handleExtract"
            >
              <span v-if="isLoading">
                <span class="spinner-border spinner-border-sm me-1" />
                Extracting…
              </span>
              <span v-else>
                Extract <i class="bi bi-arrow-right ms-1" />
              </span>
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- How it works -->
    <section class="workflow-section">
      <div class="container" style="max-width: 1100px">
        <p class="workflow-title">How it works</p>
        <div class="row g-3">
          <div
            v-for="(step, i) in steps"
            :key="step.num"
            class="col-md-4 position-relative"
          >
            <div class="workflow-step">
              <div class="step-number">{{ step.num }}</div>
              <i :class="['bi', step.icon, 'step-icon']" />
              <div class="step-title">{{ step.title }}</div>
              <div class="step-desc">{{ step.desc }}</div>
            </div>
            <i
              v-if="i < steps.length - 1"
              class="bi bi-chevron-right step-connector d-none d-md-block"
            />
          </div>
        </div>
      </div>
    </section>

  </div>
</template>