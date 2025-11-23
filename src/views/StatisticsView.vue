<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="statistics-container">
    <div class="container">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="nav-brand">
          ✈️ Flight Management
        </div>
        <div class="nav-links">
          <router-link to="/">Home</router-link>
          <router-link to="/airplanes">Airplanes</router-link>
          <router-link to="/flights">Flights</router-link>
          <router-link to="/bookings">Flight Bookings</router-link>
          <router-link to="/statistics" class="active">Statistics</router-link>
        </div>
      </nav>

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title">
          📊 Booking Statistics
        </div>
        <div class="page-subtitle">Flight booking revenue and performance analytics dashboard</div>

        <!-- Period Selector -->
        <div class="period-selector">
          <label>📅 Month:</label>
          <select v-model="selectedMonth" class="form-select">
            <option v-for="(name, index) in monthNames" :key="index" :value="index + 1">
              {{ name }}
            </option>
          </select>

          <label>📆 Year:</label>
          <select v-model="selectedYear" class="form-select">
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>

          <button class="btn-refresh" @click="loadStatistics">
            🔄 Refresh
          </button>
        </div>

        <div class="period-info">
          Showing data for {{ monthNames[selectedMonth - 1] }} {{ selectedYear }}
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading statistics...</p>
      </div>

      <!-- Main Content -->
      <div v-else-if="statisticsData" class="main-content">
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <!-- Total Bookings -->
          <div class="stat-card total">
            <div class="stat-header">
              <div class="stat-icon total">📋</div>
              <div class="stat-content">
                <div class="stat-label">Total Bookings</div>
                <div class="stat-value">{{ statisticsData.totalBookings }}</div>
                <div class="stat-subtitle">bookings in period</div>
              </div>
            </div>
          </div>

          <!-- Total Revenue -->
          <div class="stat-card revenue">
            <div class="stat-header">
              <div class="stat-icon revenue">💰</div>
              <div class="stat-content">
                <div class="stat-label">Total Revenue</div>
                <div class="stat-value">Rp {{ formatPrice(statisticsData.totalRevenue) }}</div>
                <div class="stat-subtitle">income generated</div>
              </div>
            </div>
          </div>

          <!-- Top Performance -->
          <div class="stat-card performance">
            <div class="stat-header">
              <div class="stat-icon performance">🏆</div>
              <div class="stat-content">
                <div class="stat-label">Top Performance</div>
                <div class="stat-value">{{ statisticsData.topFlightNumber || '-' }}</div>
                <div class="stat-subtitle">highest booking</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue Analysis Chart -->
        <div class="chart-section">
          <div class="chart-header">
            <div class="chart-title">
              📈 Revenue Analysis
            </div>
            <div class="chart-controls">
              <button
                :class="['chart-btn', { active: chartType === 'bar' }]"
                @click="changeChartType('bar')"
              >
                📊 Bar Chart
              </button>
              <button
                :class="['chart-btn', { active: chartType === 'line' }]"
                @click="changeChartType('line')"
              >
                📈 Line Chart
              </button>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </div>

        <!-- Flight Performance Table -->
        <div class="flight-stats-section">
          <div class="flight-stats-header">
            📋 Flight Performance Details
          </div>
          <div class="table-responsive">
            <table class="flight-stats-table">
              <thead>
                <tr>
                  <th>Flight Number</th>
                  <th>Route</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="flight in statisticsData.flightStatistics"
                  :key="flight.flightId"
                >
                  <td>
                    <div class="flight-code">{{ flight.flightNumber }}</div>
                  </td>
                  <td>
                    <div>{{ flight.originAirportCode }} → {{ flight.destinationAirportCode }}</div>
                  </td>
                  <td>
                    <strong style="color: #667eea">{{ flight.bookingCount }}</strong> bookings
                  </td>
                  <td>
                    <strong style="color: #10b981">Rp {{ formatPrice(flight.revenue) }}</strong>
                  </td>
                  <td>
                    <div class="performance-bar">
                      <div class="progress-container">
                        <div
                          class="progress-fill"
                          :style="{ width: getPerformancePercent(flight.bookingCount) + '%' }"
                        ></div>
                      </div>
                      <span class="performance-text">{{ getPerformancePercent(flight.bookingCount) }}%</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="statisticsData.flightStatistics.length === 0">
                  <td colspan="5" style="text-align: center; color: #6b7280; font-style: italic">
                    No flight performance data available for this period
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="no-data">
        <div class="no-data-icon">📊</div>
        <h3>No Data Available</h3>
        <p>No booking statistics found for the selected period</p>
        <button class="btn-refresh" @click="loadStatistics">
          🔄 Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'
import { Chart, registerables } from 'chart.js'
import type { BookingStatistics } from '@/interfaces/statistics.interface'

// Register Chart.js components
Chart.register(...registerables)

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'
// State
const loading = ref(true)
const statisticsData = ref<BookingStatistics | null>(null)
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const chartType = ref<'bar' | 'line'>('bar')
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Month names
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

// Methods
const loadStatistics = async () => {
  try {
    loading.value = true
    const response = await axios.get<BookingStatistics>(
      `${API_BASE_URL}/statistics/bookings`,
      {
        params: {
          month: selectedMonth.value,
          year: selectedYear.value
        }
      }
    )
    statisticsData.value = response.data

    // Wait for next tick to ensure canvas is rendered
    setTimeout(() => {
      renderChart()
    }, 100)
  } catch (error: any) {
    console.error('Error loading statistics:', error)
    statisticsData.value = null
  } finally {
    loading.value = false
  }
}

const renderChart = () => {
  if (!chartCanvas.value || !statisticsData.value) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const flightStats = statisticsData.value.flightStatistics || []

  if (flightStats.length === 0) {
    chartInstance = new Chart(ctx, {
      type: chartType.value,
      data: {
        labels: ['No Data'],
        datasets: [
          {
            label: 'Revenue (Rp)',
            data: [0],
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return 'Rp ' + formatPrice(Number(value))
              }
            }
          }
        }
      }
    })
    return
  }

  const labels = flightStats.map((f) => f.flightNumber)
  const revenues = flightStats.map((f) => Number(f.revenue) || 0)
  const bookings = flightStats.map((f) => f.bookingCount || 0)

  chartInstance = new Chart(ctx, {
    type: chartType.value,
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Revenue (Rp)',
          data: revenues,
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Bookings',
          data: bookings,
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return 'Rp ' + formatPrice(Number(value))
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            callback: function (value) {
              return value + ' bookings'
            }
          }
        }
      }
    }
  })
}

const changeChartType = (type: 'bar' | 'line') => {
  chartType.value = type
  renderChart()
}

const getPerformancePercent = (bookingCount: number): number => {
  // Assume 10 as base capacity
  return Math.min(Math.round((bookingCount / 10) * 100), 100)
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID').format(price)
}

// Watch for changes in month/year
watch([selectedMonth, selectedYear], () => {
  loadStatistics()
})

// Lifecycle
onMounted(() => {
  loadStatistics()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.statistics-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
}

.nav-brand {
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background 0.3s;
  font-size: 0.9rem;
}

.nav-links a:hover,
.nav-links a.active {
  background: rgba(255, 255, 255, 0.2);
}

/* Page Header */
.page-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6b7280;
  margin-bottom: 2rem;
}

.period-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.period-selector label {
  font-weight: 600;
  color: #374151;
}

.form-select {
  padding: 8px 15px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  background: white;
}

.btn-refresh {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-refresh:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}

.period-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  margin-top: 1rem;
  display: inline-block;
}

/* Loading */
.loading {
  text-align: center;
  padding: 60px;
  color: white;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.stat-card.total::before {
  background: #667eea;
}

.stat-card.revenue::before {
  background: #f59e0b;
}

.stat-card.performance::before {
  background: #10b981;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.performance {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.stat-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

/* Chart Section */
.chart-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
}

.chart-controls {
  display: flex;
  gap: 1rem;
}

.chart-btn {
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.chart-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.chart-container {
  position: relative;
  height: 400px;
}

/* Flight Stats Table */
.flight-stats-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.flight-stats-header {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

.table-responsive {
  overflow-x: auto;
}

.flight-stats-table {
  width: 100%;
  border-collapse: collapse;
}

.flight-stats-table th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.flight-stats-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
}

.flight-stats-table tr:hover {
  background: #f9fafb;
}

.flight-code {
  font-weight: 600;
  color: #667eea;
}

.performance-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-container {
  width: 100px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  border-radius: 3px;
  transition: width 0.3s;
}

.performance-text {
  font-size: 0.85rem;
  color: #6b7280;
}

/* No Data State */
.no-data {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.no-data-icon {
  font-size: 4rem;
  opacity: 0.3;
  margin-bottom: 1rem;
}

.no-data h3 {
  color: #111827;
  margin-bottom: 0.5rem;
}

.no-data p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 15px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .chart-header {
    flex-direction: column;
  }

  .period-selector {
    flex-direction: column;
  }
}
</style>
