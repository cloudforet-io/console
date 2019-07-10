const BaseHeader = () => import('@/container/header/CTHD_001_Header')

const InventoryMain = () => import('./IVNT_001_InventoryMain')
const InventorySidebar = () => import('./IVNT_002_InventorySidebar')

const DataCenter = () => import('./data_center/IVDC_001_DataCenter')
const Server = () => import('./server/IVSV_001_Server')
const CollectorPlugin = () => import('./settings/IVST_001_CollectorPlugin')

export default {
  path: 'inventory',
  name: 'inventory',
  redirect: 'inventory/data-center',
  meta: { label: 'Inventory', requiresAuth: true },
  components: {
    header: BaseHeader,
    sidebar: InventorySidebar,
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
      path: 'collector-plugin',
      name: 'collectorPlugin',
      meta: { label: 'Collector Plugin', requiresAuth: true },
      component: CollectorPlugin
    }
  ]
}
