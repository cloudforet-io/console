const Dashboard = () => import('@/views/dashboard/Dashboard.new.vue');

export default {
    path: 'dashboard',
    name: 'dashboard',
    meta: { label: 'Dashboard', breadcrumb: true },
    components: {
        // IN CASE OF SEPARATING GNB PER EACH SERVICE
        // gnb: GNB,
        // fnb: FNB,
        main: Dashboard,
    },
};
