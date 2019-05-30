const BaseHeader = () => import('@/components/base/BaseHeader')

const Dashboard = () => import('@/services/dashboard/views/Dashboard')

export default {
  path: 'dashboard',
  name: 'dashboard',
  meta: { label: 'Dashboard' },
  components: {
    header: BaseHeader,
    main: Dashboard
  }
}
