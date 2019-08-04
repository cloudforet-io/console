<template>
  <router-view />
</template>

<script>
export default {
  name: 'InventoryMain',
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.dispatch('subHeader/setNavList', [
        { label: 'Inventory', link: '/inventory' },
        { label: 'Data Center', link: '/inventory/data-center' },
        { label: 'Server', link: '/inventory/server' },
        { label: 'Collector Plugin', link: '/inventory/collector-plugin' },
      ]);
    });
  },
}
</script>

<style lang="scss" scoped>

</style>
