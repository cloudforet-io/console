<template>
  <router-view />
</template>

<script>
export default {
    name: 'InventoryMain',
    beforeRouteEnter (to, from, next) {
        next(vm => {
            vm.$store.dispatch('subHeader/setSubHeader', {
                headerGroup: { label: 'Inventory', link: '/inventory', icon: 'fal fa-warehouse-alt' },
                headerList: [
                    { label: 'Data Center', link: '/inventory/data-center' },
                    { label: 'Server', link: '/inventory/server' },
                    { label: 'Settings', link: '/inventory/settings' }
                ]
            });
        });
    }
};
</script>

<style lang="scss" scoped>

</style>
