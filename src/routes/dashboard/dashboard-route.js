const Dashboard = () => import('@/views/dashboard/Dashboard.vue');
const DashboardNavBar = () => import('@/views/dashboard/DashboardNavBar');

export default {
    path: 'dashboard',
    name: 'dashboard',
    meta: { label: 'Dashboard', breadcrumb: true },
    components: {
        // IN CASE OF SEPARATING GNB PER EACH SERVICE
        // gnb: GNB,
        // fnb: FNB,
        lnb: DashboardNavBar,
        main: Dashboard,
    },
};
