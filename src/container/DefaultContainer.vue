<template>
  <div class="app">
    <div class="app-header">
      <router-view name="header" />
    </div>

    <div class="app-body">
      <!-- <router-view name="sidebar" /> -->
      <main class="main ">
        <router-view name="main" />
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DefaultContainer',
  components: {
  },
  data () {
    return {
    };
  }
};
</script>

<style lang="scss" scoped>
$calc-height: calc(#{$header-height} + #{$sub-header-height});
.app {
  overflow-y: hidden;
  .app-header {
    position: fixed;
    height: $calc-height;
    width: 100vw;
    background-color: transparent;
    border-bottom: none;
    z-index: 100;
  }
  .app-body{
  padding-top: $calc-height;
    // width: 100vw;
    // height: calc(100vh - #{$header-height});
    padding-bottom: 1000px;
    .main {
      margin: 0 !important;
    }
  }
}
</style>
