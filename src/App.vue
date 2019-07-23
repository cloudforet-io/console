<template>
  <div id="app">
    <notifications group="auth" position="top center" :width="500" classes="v-notice" />
    <notifications group="notice" position="top left" />
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'App'
}

</script>

<style lang="scss">
  @import 'asset/scss/style';
</style>
