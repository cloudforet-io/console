import BaseHeader from '@/containers/header/Header';
import Inventory from '@/views/inventory/Inventory';
import DataCenter from '@/views/inventory/data-center/DataCenter';
import Server from '@/views/inventory/server/Server';
import Collector from '@/views/inventory/collector/Collector';
import newCollector from '@/views/inventory/collector/modules/CollectorAction';

export default {
    path: 'inventory',
    name: 'inventory',
    redirect: 'inventory/data-center',
    meta: { label: 'Inventory', requiresAuth: true },
    components: {
        header: BaseHeader,
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
            meta: { label: 'new-collectorPage', requiresAuth: true },
            component: newCollector,
        },
    ],
};
