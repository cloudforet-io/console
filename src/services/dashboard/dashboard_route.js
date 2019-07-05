const BaseHeader = () => import('@/containers/header/CTHD_001_Header')
const Dashboard = () => import('@/services/dashboard/Dashboard')

export default {
  path: 'dashboard',
  name: 'dashboard',
  meta: { label: 'dashboard', requiresAuth: true },
  components: {
    header: BaseHeader,
    main: Dashboard
  }
}
