<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: 'App',
  props: {
    processEnv: {
      type: String,
      default: process.env.NODE_ENV,
    },
  },
};

</script>

<style lang="scss">
  @import 'assets/style/style';
  //test
</style>
