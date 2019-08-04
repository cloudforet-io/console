<template>
  <router-view />
</template>

<script>
export default {
  name: 'IdentityMain',
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.dispatch('subHeader/setNavList', [
        { label: 'Identity', link: '/identity' },
        { label: 'User', link: '/identity/user' },
        { label: 'Project', link: '/identity/project' }
      ]);
    });
  },
};
</script>

<style lang="scss" scoped>

</style>
