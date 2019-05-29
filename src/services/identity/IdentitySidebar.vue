<template>
  <BaseSidebar :nav="nav" />
</template>

<script>
import BaseSidebar from '@/components/base/BaseSidebar'

export default {
  name: 'IdentitySidebar',
  components: {
    BaseSidebar
  },
  data () {
    return {
      nav: [
        {
          title: true,
          name: 'Identity'
        },
        {
          divider: true
        },
        {
          name: 'Domain',
          url: '/identity/domain',
          icon: 'icon-puzzle'
        },
        {
          name: 'Project',
          url: '/identity/project',
          icon: 'icon-puzzle'
        },
        {
          name: 'User',
          url: '/identity/user',
          icon: 'icon-puzzle'
        },
        {
          name: 'API Key',
          url: '/identity/api-key',
          icon: 'icon-puzzle'
        }
      ]
    }
  }
}
</script>
