

  <!--<AppHeaderDropdown right no-caret>

    <template slot="header">
      <i class="flag-icon flag-icon-us" /> &nbsp;
      <i class="fa fa-caret-down" />
    </template>
    <template slot="dropdown">
      <b-dropdown-item><i class="flag-icon flag-icon-us" /> English</b-dropdown-item>
      <b-dropdown-item><i class="flag-icon flag-icon-kr" /> 한국어</b-dropdown-item>
    </template>
  </AppHeaderDropdown>-->
  <template>
    <div class="field">
      <div class="control">
        <div variant="outline-danger" class="m-2">
          <select v-model="inquiry_type">
            <option disabled value="">Nothing selected</option>
            <option v-for="option in options.inquiry" v-bind:value="option.value">
              <i v-bind:class="option.flag"/> {{ option.text }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'

export default {
  name: 'LanguageDropdown',
  components: {
    AppHeaderDropdown
  },
  data () {
    return {
      inquiry_type: "",
      options: {
        inquiry: [
          { code: "en", text: "English", flag: 'flag-icon flag-icon-us'},
          { code: "kr", text: "한국어" , flag: 'flag-icon flag-icon-kr'},
        ]
      }
      }
    },
  }
</script>
  <style lang="scss" scoped>

  </style>
