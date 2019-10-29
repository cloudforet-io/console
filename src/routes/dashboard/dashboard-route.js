import BaseHeader from '@/containers/header/Header';
import Dashboard from '@/views/dashboard/Dashboard';

export default {
    path: 'dashboard',
    name: 'dashboard',
    meta: { label: 'Dashboard', requiresAuth: true },
    components: {
        header: BaseHeader,
        main: Dashboard,
    },
};
