import CloudServicePage from '@/views/inventory/cloud-service/pages/CloudServicePage';

const Inventory = () => import('@/views/inventory/Inventory.vue');
const InventoryNavBar = () => import('@/views/inventory/InventoryNavBar.vue');

const DataCenter = () => import('@/views/inventory/data-center/DataCenter.vue');
const Server = () => import('@/views/inventory/server/Server.vue');
const CloudService = () => import('@/views/inventory/cloud-service/pages/CloudService.vue');

const Collector = () => import('@/views/inventory/collector/pages/Collector.vue');

const CollectorPlugins = () => import('@/views/inventory/collector/pages/CollectorPlugins.vue');
const CollectorCreator = () => import('@/views/inventory/collector/pages/CollectorCreator.vue');

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
            path: 'cloud-service',
            name: 'cloudService',
            redirect: '/inventory/cloud-service',
            meta: { label: 'Cloud Service', breadcrumb: true, beta: true },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: 'cloudServiceMain',
                    component: CloudService,
                },
                {
                    path: ':provider/:group/:name',
                    name: 'cloudServicePage',
                    props: true,
                    component: CloudServicePage,
                },
            ],

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
                            component: CollectorPlugins,
                        },
                        {
                            path: 'collector-creator',
                            name: Symbol('collector-creator'),
                            // redirect: './plugins',
                            component: { template: '<router-view />' },
                            children: [
                                {
                                    path: ':pluginId',
                                    name: Symbol(':pluginId'),
                                    props: true,
                                    component: CollectorCreator,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
