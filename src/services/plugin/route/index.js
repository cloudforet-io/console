const BaseHeader = () => import('@/components/base/BaseHeader')

const PluginMain = () => import('@/services/plugin/views/PluginMain')
const PluginSidebar = () => import('@/services/plugin/views/PluginSidebar')

const Plugin = () => import('@/services/plugin/views/Plugin')
const PluginManager = () => import('@/services/plugin/views/PluginManager')

export default {
  path: 'plugin',
  components: {
    header: BaseHeader,
    sidebar: PluginSidebar,
    main: PluginMain
  },
  children: [
    {
      path: 'plugin',
      name: 'plugin',
      meta: { label: 'Plugin' },
      component: Plugin
    },
    {
      path: 'plugin-manager',
      name: 'pluginManager',
      meta: { label: 'Plugin Manager' },
      component: PluginManager
    }
  ]
}
