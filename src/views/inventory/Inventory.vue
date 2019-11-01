<template>
    <router-view />
</template>

<script>
export default {
    name: 'Inventory',
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            vm.$store.dispatch('header/setSubHeader', {
                headerGroup: { label: 'Inventory', link: '/inventory', icon: 'fal fa-warehouse-alt' },
                headerList: [
                    { label: 'Data Center', link: '/inventory/data-center' },
                    { label: 'Server', link: '/inventory/server' },
                    { label: 'Collector', link: '/inventory/collector' },
                ],
            });
        });
    },
};
</script>f

<style lang="scss" scoped>

</style>
