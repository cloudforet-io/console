const BaseHeader = () => import('@/components/base/BaseHeader')

const Dashboard = () => import('@/services/dashboard/Dashboard')
const Dashboard_m = () => import('@/services/cloud_mockup/Dashboard_m')

export default {
  path: 'dashboard_m',
  name: 'dashboard_m',
  meta: { label: 'dashboard_m', requiresAuth: true },
  components: {
    header: BaseHeader,
    main: Dashboard_m
  }
}
