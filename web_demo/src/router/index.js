import { createRouter, createWebHistory } from 'vue-router'
import ExtractView from '../views/ExtractView.vue'
import ValidateView from '../views/ValidateView.vue'
import DashboardView from '../views/DashboardView.vue'

const routes = [
  { path: '/', redirect: '/extract' },
  { path: '/extract', component: ExtractView, meta: { step: 1 } },
  { path: '/validate', component: ValidateView, meta: { step: 2 } },
  { path: '/dashboard', component: DashboardView, meta: { step: 3 } },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
