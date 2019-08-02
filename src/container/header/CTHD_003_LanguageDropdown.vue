
<template>
  <b-dropdown size="sm" right no-caret>
    <template slot="button-content">
      <i class="icon flag-icon flag-icon-us" /> &nbsp;
      <!-- <span class="name">English</span> &nbsp; -->
      <i class="down-btn fal fa-angle-down" />
    </template>
    <b-dropdown-item>
      <div class="item">
        <i class="icon flag-icon flag-icon-us" />
        <span class="name">English</span>
      </div>
    </b-dropdown-item>
    <b-dropdown-item>
      <div class="item">
        <i class="icon flag-icon flag-icon-kr" />
        <span class="name">한국어
        </span>
      </div>
    </b-dropdown-item>
  </b-dropdown>

  <!-- <div class="field">
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
    </div> -->
</template>

<script>
export default {
  name: 'LanguageDropdown',
  components: {
  },
  data () {
    return {
      inquiry_type: '',
      options: {
        inquiry: [
          { code: 'en', text: 'English', flag: 'flag-icon flag-icon-us' },
          { code: 'kr', text: '한국어', flag: 'flag-icon flag-icon-kr' }
        ]
      }
    };
  }
};
</script>

<style lang="scss" scoped>
.flag-icon {
  // box-shadow: 2px 2px 2px 0 rgba($black, 0.1);
  vertical-align: text-top;
}
</style>
