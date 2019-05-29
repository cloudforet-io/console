<template>
  <AppHeaderDropdown right no-caret>
    <template slot="header">
      <i class="fa fa-user" />
      {이름} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </template>
    <template slot="dropdown">
      <b-dropdown-header tag="div" class="text-center">
        <strong>Account</strong>
      </b-dropdown-header>
      <b-dropdown-item><i class="fa fa-lock" /> Logout</b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
export default {
  name: 'AccountDropdown',
  components: {
    AppHeaderDropdown
  }
}
</script>
