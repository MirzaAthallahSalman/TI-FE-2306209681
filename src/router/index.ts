import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/DashboardView.vue')
    },
    // ===== AIRLINE ROUTES =====
    // ===== AIRPLANE ROUTES =====
    {
      path: '/airplanes',
      name: 'airplane-list',
      component: () => import('@/views/airplane/AirplaneListView.vue')
    },
    {
      path: '/airplanes/create',
      name: 'airplane-create',
      component: () => import('@/views/airplane/AirplaneCreateView.vue')
    },
    {
      path: '/airplanes/:id/edit',
      name: 'airplane-edit',
      component: () => import('@/views/airplane/AirplaneEditView.vue')
    },

    // ===== FLIGHT ROUTES =====
    {
      path: '/flights',
      name: 'flight-list',
      component: () => import('@/views/flight/FlightListView.vue')
    },
    {
      path: '/flights/create',
      name: 'flight-create',
      component: () => import('@/views/flight/FlightCreateView.vue')
    },
    {
      path: '/flights/:id',
      name: 'flight-detail',
      component: () => import('@/views/flight/FlightDetailView.vue')
    },
    {
      path: '/flights/:id/update',
      name: 'flight-update',
      component: () => import('@/views/flight/FlightUpdateView.vue')
    },

    // ===== BOOKING ROUTES =====
    {
      path: '/bookings',
      name: 'booking-list',
      component: () => import('@/views/booking/BookingListView.vue')
    },
    {
     path: '/bookings/create/:id',
     name: 'booking-create',
     component: () => import('@/views/booking/BookingCreateView.vue')
    },
    {
      path: '/bookings/:id',
      name: 'booking-detail',
      component: () => import('@/views/booking/BookingDetailView.vue')
    },
    {
      path: '/bookings/:id/update',
      name: 'booking-update',
      component: () => import('@/views/booking/BookingUpdateView.vue')
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('@/views/StatisticsView.vue')
    }
  ]
})

export default router
