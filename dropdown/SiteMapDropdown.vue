<template>
  <AppHeaderDropdown>
    <template slot="header">
      Services
    </template>
    <template slot="dropdown">
      <b-dropdown-header tag="div" class="text-center" />
      <b-dropdown-item to="/dashboard">
        <i class="icon-user" /> Dashboard
      </b-dropdown-item>
      <b-dropdown-header tag="div" class="text-center">
        <strong>Identity</strong>
      </b-dropdown-header>
      <b-dropdown-item to="/identity/domain">
        <i class="icon-user" /> Domain
      </b-dropdown-item>
      <b-dropdown-item to="/identity/project">
        <i class="icon-user" /> Project
      </b-dropdown-item>
      <b-dropdown-item to="/identity/user">
        <i class="icon-user" /> User
      </b-dropdown-item>
      <b-dropdown-item to="/identity/api-key">
        <i class="icon-user" /> API Key
      </b-dropdown-item>
      <b-dropdown-header tag="div" class="text-center">
        <strong>Inventory</strong>
      </b-dropdown-header>
      <b-dropdown-item to="/inventory/data-center">
        <i class="icon-user" /> Data Center
      </b-dropdown-item>
      <b-dropdown-item to="/inventory/server">
        <i class="icon-user" /> Server
      </b-dropdown-item>
      <b-dropdown-item to="/inventory/network">
        <i class="icon-user" /> Network
      </b-dropdown-item>
      <b-dropdown-header tag="div" class="text-center">
        <strong>Plugin</strong>
      </b-dropdown-header>
      <b-dropdown-item to="/plugin/plugin-manager">
        <i class="icon-user" /> Plugin Manager
      </b-dropdown-item>
      <b-dropdown-item to="/plugin/plugin">
        <i class="icon-user" /> Plugin
      </b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
export default {
  name: 'SiteMapDropdown',
  components: {
    AppHeaderDropdown
  },
  data: () => {
    return { itemsCount: 42 }
  }
}
</script>
