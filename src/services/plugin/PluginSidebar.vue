<template>
  <BaseSidebar :nav="nav" />
</template>

<script>
import BaseSidebar from '@/components/base/BaseSidebar'

export default {
  name: 'PluginSidebar',
  components: {
    BaseSidebar
  },
  data () {
    return {
      nav: [
        {
          title: true,
          name: 'Plugin'
        },
        {
          divider: true
        },
        {
          name: 'Plugin Manager',
          url: '/plugin/plugin-manager',
          icon: 'icon-puzzle'
        },
        {
          name: 'Plugin',
          url: '/plugin/plugin',
          icon: 'icon-puzzle'
        }
      ]
    }
  }
}
</script>
