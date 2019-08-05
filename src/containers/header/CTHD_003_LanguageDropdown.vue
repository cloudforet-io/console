
<template>
  <b-dropdown size="sm" right no-caret>
    <template #button-content>
      <span class="lang name">{{ selected.code }}</span> &nbsp;
      <i class="icon" :class="selected.flag" /> &nbsp;
      <i class="fal fa-angle-down" />
    </template>
    <b-dropdown-item v-for="(lang, idx) in languages" :key="lang.code" @click="changeLanguage(idx)">
      <div class="item">
        <i class="icon" :class="lang.flag" />
        <span class="name">{{ lang.text }}</span>
      </div>
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
export default {
    name: 'LanguageDropdown',
    components: {
    },
    data () {
        return {
            languages: [
                { code: 'en', text: 'English', flag: 'flag-icon flag-icon-us' },
                { code: 'ko', text: '한국어', flag: 'flag-icon flag-icon-kr' }
            ],
            selected: { code: 'en', text: 'English', flag: 'flag-icon flag-icon-us' }
        };
    },
    methods: {
        changeLanguage (idx) {
            this.selected = this.languages[idx];
            this.$i18n.locale = this.selected.code;
        }
    }
};
</script>

<style lang="scss" scoped>
.lang.name {
  text-transform: uppercase;
}
.flag-icon {
  vertical-align: text-top;
}
</style>
