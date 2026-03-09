/**
 * API layer — swap mock implementations for real fetch() calls when backend is ready.
 * All components import from here, never call fetch() directly.
 */
import { mockExtractResult } from '../mock/extractResult.js'
import { mockEvents } from '../mock/events.js'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export const api = {
  /** POST /api/extract */
  async extract(text) {
    // TODO: return await fetch('/api/extract', { method:'POST', body: JSON.stringify({ text }) }).then(r=>r.json())
    await delay(1400)
    return mockExtractResult(text)
  },

  /** POST /api/validate */
  async validate(jsonData) {
    // TODO: return await fetch('/api/validate', { method:'POST', body: JSON.stringify(jsonData) }).then(r=>r.json())
    await delay(300)
    const errors = []

    // ── Required fields ──────────────────────────────────────────
    const REQUIRED = [
      { label: 'Disaster Group', get: d => d?.Event?.['Disaster Group'] },
      { label: 'Disaster Type',  get: d => d?.Event?.['Disaster Type']  },
      { label: 'Country',        get: d => d?.['Geographical Information']?.Country },
    ]
    for (const f of REQUIRED) {
      if (!f.get(jsonData)) errors.push(`${f.label} is required`)
    }

    // ── Date format: YYYY, YYYY-MM, or YYYY-MM-DD ────────────────
    const date = jsonData?.Event?.['Disaster Date (YMD)']
    if (date && !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(date)) {
      errors.push(`Disaster Date must be YYYY, YYYY-MM, or YYYY-MM-DD (got "${date}")`)
    }

    // ── Effect fields must be non-negative numbers if present ────
    const EFFECT_FIELDS = [
      'Number of Deaths',
      'Number of missing [Missing persons]',
      'Number of Injured',
      'Number of affected',
      'Number of damaged and destroyed dwellings ',
    ]
    for (const f of EFFECT_FIELDS) {
      const v = jsonData?.Effect?.[f]
      if (v !== undefined && v !== '' && v !== null) {
        if (isNaN(Number(v)) || Number(v) < 0) {
          errors.push(`Effect.${f} must be a non-negative number (got "${v}")`)
        }
      }
    }

    return { valid: errors.length === 0, missing: errors }
  },

  /** GET /api/events */
  async getEvents() {
    // TODO: return await fetch('/api/events').then(r=>r.json())
    await delay(200)
    return mockEvents()
  },

  /** POST /api/events */
  async addEvent(eventData) {
    // TODO: return await fetch('/api/events', { method:'POST', body: JSON.stringify(eventData) }).then(r=>r.json())
    await delay(400)
    const stored = JSON.parse(localStorage.getItem('appended_events') || '[]')
    const newEvent = { ...eventData, _id: Date.now(), _new: true }
    stored.push(newEvent)
    localStorage.setItem('appended_events', JSON.stringify(stored))
    return { success: true, event: newEvent }
  },

  getAppendedEvents() {
    return JSON.parse(localStorage.getItem('appended_events') || '[]')
  },
}