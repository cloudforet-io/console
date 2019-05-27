<template>
  <SidebarNav :navItems="this[`${this.$route.name}Nav`]"></SidebarNav>
</template>

<script>
import { SidebarNav } from '@coreui/vue'
import { mapState } from 'vuex'

  export default {
    components: {
      SidebarNav
    },
    ...mapState('assets', {
      assetsNav: state => state.nav,
    }),
  }
</script>

<style lang="scss" scoped>

</style>