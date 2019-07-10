<template>
  <div class="app">
    <router-view name="header" />

    <div class="app-body">
      <router-view name="sidebar" />
      <main class="main">
        <div class="container-fluid">
          <router-view name="main" />
        </div>
      </main>
    </div>

    <TheFooter>
      <div>
        <a href="https://coreui.io">Steamugs.</a>
        <span class="ml-1">&copy; 2019 Steamugs.</span>
      </div>
      <div class="ml-auto">
        <span class="mr-1">Powered by</span>
        <a href="https://coreui.io">Steamugs.</a>
      </div>
    </TheFooter>
  </div>
</template>

<script>
import { Footer as TheFooter } from '@coreui/vue'

export default {
  name: 'DefaultContainer',
  components: {
    TheFooter
  },
  data () {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>
.container-fluid {
  padding: 20px;
}
</style>
