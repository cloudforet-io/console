const Plugin = () => import('@/views/plugin/plugin');
const PluginNavBar = () => import('@/views/plugin/pluginNavBar');
const SupervisorPlugins = () => import('@/views/plugin/supervisor/pages/SupervisorPlugins.vue');

export default {
    path: 'plugin',
    name: 'plugin',
    redirect: '/plugin/supervisor/plugins',
    meta: { label: 'Plugin', breadcrumb: true },
    components: {
        lnb: PluginNavBar,
        main: Plugin,
    },
    children: [
        {
            path: 'supervisor',
            name: 'supervisor',
            meta: { label: 'Supervisor', breadcrumb: true },
            redirect: '/plugin/supervisor/plugins',
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
