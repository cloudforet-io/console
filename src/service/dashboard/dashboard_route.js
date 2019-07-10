const BaseHeader = () => import('@/container/header/CTHD_001_Header')
const DashboardMain = () => import('@/service/dashboard/DSBD_001_DashboardMain')

export default {
  path: 'dashboard',
  name: 'dashboard',
  meta: { label: 'dashboard', requiresAuth: true },
  components: {
    header: BaseHeader,
    main: DashboardMain
  }
}
