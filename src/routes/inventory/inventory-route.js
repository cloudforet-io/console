const Inventory = () => import('@/views/inventory/Inventory.vue');
const InventoryNavBar = () => import('@/views/inventory/InventoryNavBar.vue');

const DataCenter = () => import('@/views/inventory/data-center/DataCenter.vue');
const Server = () => import('@/views/inventory/server/Server.vue');
const Collector = () => import('@/views/inventory/collector/pages/Collector.vue');
const newCollector = () => import('@/views/inventory/collector_origin/modules/CollectorAction.vue');

export default {
    path: 'inventory',
    name: 'inventory',
    redirect: 'inventory/data-center',
    meta: { label: 'Inventory', requiresAuth: true },
    components: {
        lnb: InventoryNavBar,
        main: Inventory,
    },
    children: [
        {
            path: 'data-center',
            name: 'dataCenter',
            meta: { label: 'Data Center', requiresAuth: true },
            component: DataCenter,
        },
        {
            path: 'server',
            name: 'server',
            meta: { label: 'Server', requiresAuth: true },
            component: Server,
        },
        {
            path: 'collector',
            name: 'collector',
            meta: { label: 'Collector', requiresAuth: true },
            component: Collector,
        },
        {
            path: 'collector/new-collector',
            name: 'new-collectorPage',
            meta: { label: 'Collector', requiresAuth: true },
            component: newCollector,
        },
    ],
};
