<template>
  <div class="app">
    <div class="app-header">
      <router-view name="header" />
    </div>

    <div class="app-body">
      <!-- <router-view name="sidebar" /> -->
      <router-view name="sub-header" />
      <main class="main container-fluid">
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
    }
  }
}
</script>

<style lang="scss" scoped>
.app {
  position: relative;
  width: 100vw;
  height: 100vh;
  .app-header {
    position: fixed;
    top: 0;
    left: 0;
    height: $header-height;
    width: 100vw;
    background-color: transparent;
    border-bottom: none;
    z-index: 100;
  }
  .app-body{
    position: absolute;
    top: $header-height;
    left: 0;
    width: 100vw;
    height: calc(100vh - #{$header-height});
    .main {
      padding: $side-pad;
      margin: 0 !important;
      overflow: scroll;
    }
  }
}
</style>
