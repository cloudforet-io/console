<template>
  <div id="app">
    <notifications group="auth" position="top center" :width="500" classes="v-notice"/>
    <notifications group="notice" position="top left" />
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App'
}
</script>

<style lang="scss">

  .app-body{
    background-color: #fafafa
  }


  // CoreUI Icons Set
  @import '~@coreui/icons/css/coreui-icons.min.css';
  /* Import Font Awesome Icons Set */
  $fa-font-path: '~font-awesome/fonts/';
  @import '~font-awesome/scss/font-awesome.scss';
  /* Import Simple Line Icons Set */
  $simple-line-font-path: '~simple-line-icons/fonts/';
  @import '~simple-line-icons/scss/simple-line-icons.scss';
  /* Import Flag Icons Set */
  @import '~flag-icon-css/css/flag-icon.min.css';
  /* Import Bootstrap Vue Styles */
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
  // Import Main styles for this application
  @import 'assets/scss/style';
</style>
