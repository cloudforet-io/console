const Management = () => import('@/views/management/management');
const ManagementNavBar = () => import('@/views/management/managementNavBar');
const SupervisorPlugins = () => import('@/views/management/supervisor/pages/SupervisorPlugins_new.vue');

export default {
    path: 'management',
    name: 'management',
    redirect: '/management/supervisor/plugins',
    meta: { label: 'Management', breadcrumb: true },
    components: {
        lnb: ManagementNavBar,
        main: Management,
    },
    children: [
        {
            path: 'supervisor',
            name: 'supervisor',
            meta: { label: 'Supervisor', breadcrumb: true },
            redirect: '/management/supervisor/plugins',
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'plugins',
                    name: 'supervisorPlugins',
                    meta: {
                        label: 'Plugins',
                        breadcrumb: true,
                        isDomainOwnerOnly: true,
                    },
                    component: SupervisorPlugins,
                },
            ],
        },
    ],
};
