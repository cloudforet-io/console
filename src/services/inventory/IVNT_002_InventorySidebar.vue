<template>
  <BaseSidebar :nav="nav" />
</template>

<script>
import BaseSidebar from '@/containers/sidebar/CTSB_001_Sidebar'

export default {
  name: 'InventorySidebar',
  components: {
    BaseSidebar
  },
  data () {
    return {
      nav: [
        {
          title: true,
          name: 'Inventory'
        },
        {
          divider: true
        },
        {
          name: 'Data Center',
          url: '/inventory/data-center',
          icon: 'icon-puzzle'
        },
        {
          name: 'Server',
          url: '/inventory/server',
          icon: 'icon-puzzle'
        },
        {
          name: 'Settings(Admin)',
          url: '/inventory/collector-plugin',
          icon: 'icon-puzzle'
        }
      ]
    }
  }
}
</script>
