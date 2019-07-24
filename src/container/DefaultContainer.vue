<template>
  <div class="app">
    <div class="app-header">
      <router-view name="header" />
    </div>

    <div class="app-body">
      <!-- <router-view name="sidebar" /> -->
      <router-view name="sub-header" />
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
.app {
  overflow-y: hidden;
  .app-header {
    position: fixed;
    height: $header-height;
    width: 100vw;
    background-color: transparent;
    border-bottom: none;
    z-index: 100;
  }
  .app-body{
  padding-top: $header-height;
    // width: 100vw;
    // height: calc(100vh - #{$header-height});
    padding-bottom: 1000px;
    .main {
      padding: $side-pad;
      margin: 0 !important;
    }
  }
}
</style>
