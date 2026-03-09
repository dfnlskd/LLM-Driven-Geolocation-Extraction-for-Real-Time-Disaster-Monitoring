<script setup>
defineProps({
  status: {
    type: String,
    default: 'idle',   // 'idle' | 'valid' | 'invalid'
  },
  missing: {
    type: Array,
    default: () => [],
  },
})
defineEmits(['validate'])
</script>

<template>
  <div class="vbar" :class="`vbar--${status}`">
    <div class="vbar-left">
      <template v-if="status === 'idle'">
        <i class="bi bi-info-circle me-2" />
        <span>Click <strong>Validate</strong> to check required fields before appending.</span>
      </template>
      <template v-else-if="status === 'valid'">
        <i class="bi bi-check-circle-fill me-2" />
        <span>All required fields present — ready to append to Dashboard.</span>
      </template>
      <template v-else>
        <i class="bi bi-exclamation-triangle-fill me-2" />
        <span>Missing required fields:
          <strong>{{ missing.join(', ') }}</strong>
        </span>
      </template>
    </div>
    <button
      v-if="status !== 'valid'"
      class="btn btn-sm vbar-btn"
      @click="$emit('validate')"
    >
      Validate
    </button>
  </div>
</template>

<style scoped>
.vbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.82rem;
  gap: 12px;
}
.vbar--idle {
  background: #f0f2f5;
  color: var(--text-secondary);
}
.vbar--valid {
  background: rgba(90,170,122,0.12);
  color: #3a8a5a;
}
.vbar--invalid {
  background: rgba(224,123,57,0.12);
  color: #c0612a;
}
.vbar-left {
  display: flex;
  align-items: center;
  flex: 1;
}
.vbar-btn {
  flex-shrink: 0;
  background: var(--color-primary);
  color: #fff;
  border: none;
  padding: 4px 14px;
}
.vbar-btn:hover {
  background: var(--color-primary-dark);
  color: #fff;
}
</style>
