const BaseHeader = () => import('@/components/base/BaseHeader')

const InventoryMain = () => import('./InventoryMain')
const InventorySidebar = () => import('./InventorySidebar')

const DataCenter = () => import('./data-center/DataCenter')
const Server = () => import('./server/Server')
const CollectorPlugin = () => import('./settings/CollectorPlugin')

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
