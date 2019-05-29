<template>
  <AppHeaderDropdown right no-caret>
    <template slot="header">
      <i class="flag-icon flag-icon-us" /> &nbsp;
      <i class="fa fa-caret-down" />
    </template>
    <template slot="dropdown">
      <b-dropdown-item><i class="flag-icon flag-icon-us" /> English</b-dropdown-item>
      <b-dropdown-item><i class="flag-icon flag-icon-kr" /> 한국어</b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
export default {
  name: 'LanguageDropdown',
  components: {
    AppHeaderDropdown
  }
}
</script>
