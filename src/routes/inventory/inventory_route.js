// const BaseHeader = () => import('@/containers/header/CTHD_001_Header');
import BaseHeader from '@/containers/header/CTHD_001_Header';
const InventoryMain = () => import('@/views/inventory/IVNT_001_InventoryMain');
const DataCenter = () => import('@/views/inventory/data_center/IVDC_001_DataCenter');
const Server = () => import('@/views/inventory/server/IVSV_001_Server');
const Collector = () => import('@/views/inventory/collector/IVCO_001_Collector');

export default {
    path: 'inventory',
    name: 'inventory',
    redirect: 'inventory/data-center',
    meta: { label: 'Inventory', requiresAuth: true },
    components: {
        header: BaseHeader,
        main: InventoryMain
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
        }
    ]
};
