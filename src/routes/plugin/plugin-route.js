const Plugin = () => import('@/views/plugin/plugin');
const PluginNavBar = () => import('@/views/plugin/pluginNavBar');
const Supervisor = () => import('@/views/plugin/supervisor/pages/Supervisor.vue');

export default {
    path: 'plugin',
    name: 'plugin',
    redirect: '/plugin/supervisor',
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
            component: Supervisor,
        },
    ],
};
