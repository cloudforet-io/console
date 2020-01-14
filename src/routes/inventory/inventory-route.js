const Inventory = () => import('@/views/inventory/Inventory.vue');
const InventoryNavBar = () => import('@/views/inventory/InventoryNavBar.vue');

const DataCenter = () => import('@/views/inventory/data-center/DataCenter.vue');
const Server = () => import('@/views/inventory/server/Server.vue');
const Collector = () => import('@/views/inventory/collector/pages/Collector.vue');

const CollectorPlugins = () => import('@/views/inventory/collector/pages/CollectorPlugins.vue');

export default {
    path: 'inventory',
    name: 'inventory',
    redirect: 'inventory/data-center',
    meta: { label: 'Inventory', breadcrumb: true },
    components: {
        lnb: InventoryNavBar,
        main: Inventory,
    },
    children: [
        {
            path: 'data-center',
            name: 'dataCenter',
            meta: { label: 'Data Center', breadcrumb: true },
            component: DataCenter,
        },
        {
            path: 'server',
            name: 'server',
            meta: { label: 'Server', breadcrumb: true },
            component: Server,
        },
        {
            path: 'collector',
            name: 'collector',
            redirect: '/inventory/collector',
            meta: { label: 'Collector', breadcrumb: true },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: 'collectorMain',
                    meta: { label: '', requiresAuth: true },
                    component: Collector,
                },
                {
                    path: 'create',
                    name: 'createCollector',
                    meta: { label: 'Create Collector', breadcrumb: true },
                    redirect: './create/plugins',
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: 'plugins',
                            name: 'collectorPlugins',
                            meta: { label: 'Plugins' },
                            component: CollectorPlugins,
                        },
                        {
                            path: 'collector-creator',
                            name: 'collectorCreator',
                            meta: { label: 'Collector Creator' },
                            component: CollectorPlugins,
                        },
                    ],
                },
            ],
        },
    ],
};
