<template>
  <BaseSidebar :nav="nav" />
</template>

<script>
import BaseSidebar from '@/components/base/BaseSidebar'

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
          title: true,
          name: 'Network'
        },
        {
          name: 'Network',
          url: '/inventory/network/network',
          icon: 'icon-puzzle'
        },
        {
          name: 'Network Type',
          url: '/inventory/network/type',
          icon: 'icon-puzzle'
        },
        {
          name: 'IP Address',
          url: '/inventory/network/ip-address',
          icon: 'icon-puzzle'
        }
      ]
    }
  }
}
</script>
