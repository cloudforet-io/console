const BaseHeader = () => import('@/containers/header/CTHD_001_Header');
const DashboardMain = () => import('@/views/dashboard/DSBD_001_DashboardMain');

export default {
    path: 'dashboard',
    name: 'dashboard',
    meta: { label: 'dashboard', requiresAuth: true },
    components: {
        header: BaseHeader,
        main: DashboardMain
    }
};
