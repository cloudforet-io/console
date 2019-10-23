// const BaseHeader = () => import('@/containers/header/Header');
import BaseHeader from '@/containers/header/Header';
const Inventory = () => import('@/views/inventory/Inventory');
const DataCenter = () => import('@/views/inventory/data-center/DataCenter');
const Server = () => import('@/views/inventory/server/Server');
const Collector = () => import('@/views/inventory/collector/Collector');
const newCollector = () => import('@/views/inventory/collector/modules/CollectorAction');
export default {
    path: 'inventory',
    name: 'inventory',
    redirect: 'inventory/data-center',
    meta: { label: 'Inventory', requiresAuth: true },
    components: {
        header: BaseHeader,
        main: Inventory
    },
    children: [
        {
            path: 'data-center',
            name: 'dataCenter',
            meta: { label: 'Data Center', requiresAuth: true },
            component: DataCenter
        },
        {
            path: 'server',
            name: 'server',
            meta: { label: 'Server', requiresAuth: true },
            component: Server
        },
        {
            path: 'collector',
            name: 'collector',
            meta: { label: 'Collector', requiresAuth: true },
            component: Collector
        },
        {
            path: 'collector/new-collector',
            name: 'new-collectorPage',
            meta: { label: 'new-collectorPage', requiresAuth: true },
            component: newCollector
        }
    ]
};
