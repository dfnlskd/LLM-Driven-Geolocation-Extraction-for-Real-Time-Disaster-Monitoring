<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const steps = [
  { label: 'Extract',   path: '/extract'   },
  { label: 'Validate',  path: '/validate'  },
  { label: 'Dashboard', path: '/dashboard' },
]
</script>

<template>
  <nav class="app-nav">
    <!-- Brand -->
    <div class="brand">
      <span class="brand-text">Disaster Information Extraction</span>
    </div>

    <!-- Steps -->
    <div class="steps">
      <RouterLink
        v-for="s in steps"
        :key="s.path"
        :to="s.path"
        :class="['step-link', { active: route.path === s.path }]"
      >{{ s.label }}</RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.app-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-nav);
  padding: 0 24px;
  height: 52px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
}
.brand-text {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}

/* Step links */
.steps {
  display: flex;
  align-items: stretch;
  height: 100%;
  gap: 0;
}

.step-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 0 18px;
  position: relative;
  transition: color 0.15s;
  border-left: 1px solid rgba(255,255,255,0.1);
}
.step-link:first-child { border-left: none; }

.step-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 18px;
  right: 18px;
  height: 2px;
  background: #fff;
  border-radius: 2px 2px 0 0;
  transform: scaleX(0);
  transition: transform 0.2s;
}

.step-link:hover {
  color: rgba(255,255,255,0.85);
}
.step-link:hover::after {
  transform: scaleX(0.5);
  background: rgba(255,255,255,0.4);
}

.step-link.active {
  color: #fff;
  font-weight: 600;
}
.step-link.active::after {
  transform: scaleX(1);
}

</style>
