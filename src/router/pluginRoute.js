const BaseHeader = () => import('@/components/base/BaseHeader')

const PluginMain = () => import('@/services/plugin/PluginMain')
const PluginSidebar = () => import('@/services/plugin/PluginSidebar')

const Plugin = () => import('@/services/plugin/Plugin')
const PluginManager = () => import('@/services/plugin/PluginManager')

export default {
  path: 'plugin',
  meta: { label: 'Plugin', requiresAuth: true },
  components: {
    header: BaseHeader,
    sidebar: PluginSidebar,
    main: PluginMain
  },
  children: [
    {
      path: 'plugin',
      name: 'plugin',
      meta: { label: 'Plugin', requiresAuth: true },
      component: Plugin
    },
    {
      path: 'plugin-manager',
      name: 'pluginManager',
      meta: { label: 'Plugin Manager', requiresAuth: true },
      component: PluginManager
    }
  ]
}
