<template>
  <div id="app">
    <notifications group="auth" position="top center" :width="500" classes="v-notice" />
    <notifications group="notice" position="top left" />
    <router-view />
  </div>
</template>
<script>
export default {
    name: 'App',
    props: {
        processEnv: {
            type: String,
            default: process.env.NODE_ENV
        }
    }
};

</script>

<style lang="scss">
  @import 'asset/style/style';
</style>
