<script setup>
defineProps({
  example: { type: Object, required: true },
  active:  { type: Boolean, default: false },
})
defineEmits(['select'])

const groupIcon = {
  Hydrological:      'bi-water',
  Geophysical:       'bi-activity',
  Meteorological:    'bi-wind',
  Biological:        'bi-virus',
  Climatological:    'bi-sun',
  'Industrial accident': 'bi-exclamation-triangle',
  'Miscellaneous accident': 'bi-exclamation-circle',
  Transport:         'bi-truck',
}
</script>

<template>
  <button
    class="example-card"
    :class="{ active }"
    @click="$emit('select', example)"
  >
    <div class="card-left">
      <i :class="['bi', groupIcon[example.group] ?? 'bi-globe', 'card-icon']" />
    </div>
    <div class="card-body-inner">
      <div class="card-label">{{ example.label }}</div>
      <div class="card-date">{{ example.date }}</div>
    </div>
    <div class="card-arrow">
      <i class="bi bi-arrow-right" />
    </div>
  </button>
</template>

<style scoped>
.example-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: var(--border-radius);
  padding: 10px 14px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.example-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
.example-card.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.card-left {
  flex-shrink: 0;
}
.card-icon {
  font-size: 1.15rem;
  color: var(--color-primary);
}
.card-body-inner {
  flex: 1;
  min-width: 0;
}
.card-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-date {
  font-size: 0.73rem;
  color: var(--text-muted);
  margin-top: 1px;
}
.card-arrow {
  flex-shrink: 0;
  color: var(--text-muted);
  font-size: 0.8rem;
  transition: color 0.15s;
}
.example-card:hover .card-arrow {
  color: var(--color-primary);
}
</style>
