const BaseHeader = () => import('@/containers/header/Header');
const Dashboard = () => import('@/views/dashboard/Dashboard');

export default {
    path: 'dashboard',
    name: 'dashboard',
    meta: { label: 'Dashboard', requiresAuth: true },
    components: {
        header: BaseHeader,
        main: Dashboard
    }
};
