<template>
  <router-view />
</template>

<script>
export default {
    name: 'IdentityMain',
    beforeRouteEnter (to, from, next) {
        next(vm => {
            vm.$store.dispatch('header/setSubHeader', {
                headerGroup: { label: 'Identity', link: '/identity', icon: 'fal fa-address-card' },
                headerList: [
                    { label: 'User', link: '/identity/user' },
                    { label: 'Project', link: '/identity/project' }
                ]
            });
        });
    }
};
</script>

<style lang="scss" scoped>

</style>
