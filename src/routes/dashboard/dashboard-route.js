const Dashboard = () => import('@/views/dashboard/Dashboard');

export default {
    path: 'dashboard',
    name: 'dashboard',
    meta: { label: 'Dashboard', requiresAuth: true },
    components: {
        // IN CASE OF SEPARATING GNB PER EACH SERVICE
        // gnb: GNB,
        main: Dashboard,
    },
};
