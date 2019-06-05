const BaseHeader = () => import('@/components/base/BaseHeader')

const Dashboard = () => import('@/services/dashboard/Dashboard')

export default {
  path: 'dashboard',
  name: 'dashboard',
  meta: { label: 'Dashboard', requiresAuth: true },
  components: {
    header: BaseHeader,
    main: Dashboard
  }
}
