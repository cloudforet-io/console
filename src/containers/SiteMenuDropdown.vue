<template>
  <AppHeaderDropdown right no-caret>
    <template slot="header">
      <i class="icon-grid"></i>
    </template>\
    <template slot="dropdown">
      <b-dropdown-header tag="div" class="text-center"><strong>Identity</strong></b-dropdown-header>
      <b-dropdown-item><i class="icon-user" /> Users</b-dropdown-item>
      <b-dropdown-header tag="div" class="text-center"><strong>Infra</strong></b-dropdown-header>
      <b-dropdown-item><i class="icon-user" /> Infra Layers</b-dropdown-item>
      <b-dropdown-item><i class="icon-user" /> Networks</b-dropdown-item>
      <b-dropdown-item><i class="icon-user" /> Assets</b-dropdown-item>
      <b-dropdown-header tag="div" class="text-center"><strong>Dev Ops</strong></b-dropdown-header>
      <b-dropdown-item><i class="icon-user" /> Servers</b-dropdown-item>
      <b-dropdown-item><i class="icon-user" /> Projects</b-dropdown-item>
      <b-dropdown-header tag="div" class="text-center"><strong>Support Center</strong></b-dropdown-header>
      <b-dropdown-item><i class="icon-user" /> FAQ</b-dropdown-item>
      <b-dropdown-item><i class="icon-user" /> Board</b-dropdown-item>
      

    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
export default {
  name: 'SiteMenuDropdown',
  components: {
    AppHeaderDropdown
  },
  data: () => {
    return { itemsCount: 42 }
  }
}
</script>
