import { createRouter, createWebHistory } from 'vue-router'
import type { UserRole } from '@/interfaces/auth.interface'

// Extend RouteMeta to include our custom properties
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    requiresGuest?: boolean
    allowedRoles?: UserRole[]
    excludeRoles?: UserRole[]
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/DashboardView.vue'),
      meta: {
        requiresAuth: true,
        excludeRoles: ['CUSTOMER'], // Customer cannot access home
      },
    },

    // ===== AUTH ROUTES =====
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: {
        title: 'Login',
        requiresGuest: true,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: {
        title: 'Register',
        requiresGuest: true,
      },
    },

    // ===== AIRLINE ROUTES =====
    // ===== AIRPLANE ROUTES =====
    {
      path: '/airplanes',
      name: 'airplane-list',
      component: () => import('@/views/airplane/AirplaneListView.vue'),
      meta: {
        requiresAuth: true,
        excludeRoles: ['CUSTOMER'], // Customer cannot access airplanes
      },
    },
    {
      path: '/airplanes/create',
      name: 'airplane-create',
      component: () => import('@/views/airplane/AirplaneCreateView.vue'),
      meta: {
        requiresAuth: true,
        excludeRoles: ['CUSTOMER'],
      },
    },
    {
      path: '/airplanes/:id/edit',
      name: 'airplane-edit',
      component: () => import('@/views/airplane/AirplaneEditView.vue'),
      meta: {
        requiresAuth: true,
        excludeRoles: ['CUSTOMER'],
      },
    },

    // ===== FLIGHT ROUTES =====
    {
      path: '/flights',
      name: 'flight-list',
      component: () => import('@/views/flight/FlightListView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/flights/create',
      name: 'flight-create',
      component: () => import('@/views/flight/FlightCreateView.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: ['SUPERADMIN', 'FLIGHT_AIRLINE'], // Only SUPERADMIN and FLIGHT_AIRLINE can create flights
      },
    },
    {
      path: '/flights/:id',
      name: 'flight-detail',
      component: () => import('@/views/flight/FlightDetailView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/flights/:id/update',
      name: 'flight-update',
      component: () => import('@/views/flight/FlightUpdateView.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: ['SUPERADMIN', 'FLIGHT_AIRLINE'], // Only SUPERADMIN and FLIGHT_AIRLINE can update flights
      },
    },

    // ===== BOOKING ROUTES =====
    {
      path: '/bookings',
      name: 'booking-list',
      component: () => import('@/views/booking/BookingListView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/bookings/create/:id',
      name: 'booking-create',
      component: () => import('@/views/booking/BookingCreateView.vue'),
      meta: {
        requiresAuth: true,
        excludeRoles: ['FLIGHT_AIRLINE'], // Flight Airline cannot create bookings
      },
    },
    {
      path: '/bookings/:id',
      name: 'booking-detail',
      component: () => import('@/views/booking/BookingDetailView.vue'),
      meta: {
        requiresAuth: true,
        excludeRoles: ['FLIGHT_AIRLINE'], // Flight Airline cannot view booking detail
      },
    },
    {
      path: '/bookings/:id/update',
      name: 'booking-update',
      component: () => import('@/views/booking/BookingUpdateView.vue'),
      meta: {
        requiresAuth: true,
        excludeRoles: ['FLIGHT_AIRLINE'], // Flight Airline cannot update bookings
      },
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('@/views/StatisticsView.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: ['SUPERADMIN', 'FLIGHT_AIRLINE'], // Only SUPERADMIN and FLIGHT_AIRLINE can access
      },
    },

    {
      path: '/tickets',
      name: 'ticket-list',
      component: () => import('@/views/support/TicketList.vue'),
      meta: {
        title: 'Support Tickets',
        requiresAuth: true,
      },
    },
    {
      path: '/tickets/create',
      name: 'ticket-create',
      component: () => import('@/views/support/TicketCreate.vue'),
      meta: {
        title: 'Buat Ticket',
        requiresAuth: true,
        allowedRoles: ['CUSTOMER'], // Only customers can create tickets
      },
    },
    {
      path: '/tickets/:id',
      name: 'ticket-detail',
      component: () => import('@/views/support/TicketDetail.vue'),
      meta: {
        title: 'Detail Ticket',
        requiresAuth: true,
      },
    },
  ],
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  // Import inside to avoid circular dependency
  const { useAuthStore } = await import('@/stores/auth/authStore')
  const authStore = useAuthStore()

  // Initialize auth from localStorage on first load
  if (!authStore.isAuthenticated) {
    authStore.initAuth()
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login with return URL
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect based on role
    next(authStore.getRedirectPath())
    return
  }

  // Check for excluded roles
  if (to.meta.excludeRoles && Array.isArray(to.meta.excludeRoles)) {
    const userRole = authStore.userRole
    if (userRole && to.meta.excludeRoles.includes(userRole)) {
      // User's role is excluded from this route
      next(authStore.getRedirectPath())
      return
    }
  }

  // Check for role-based access
  if (to.meta.allowedRoles && Array.isArray(to.meta.allowedRoles)) {
    const userRole = authStore.userRole
    if (!userRole || !to.meta.allowedRoles.includes(userRole)) {
      // User doesn't have required role
      next(authStore.getRedirectPath())
      return
    }
  }

  next()
})

export default router
