
<template>
  <b-dropdown size="sm" right no-caret>
    <template #button-content>
      <span class="lang name">{{ selected.value }}</span> &nbsp;
      <i class="icon" :class="selected.icon" /> &nbsp;
      <i class="fal fa-angle-down" />
    </template>
    <b-dropdown-item v-for="(lang, idx) in languages" :key="lang.value" @click="changeLanguage(idx)">
      <div class="item">
        <i class="icon" :class="lang.icon" />
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
            /**
             * TODO: Get User's language from the Stroage.
             */
            selected: this.getLanguage('en')
        };
    },
    computed: {
        languages () {
            return this.getLanguageSelectList();
        }
    },
    created () {
        this.init();
    },
    methods: {
        changeLanguage (idx) {
            this.selected = this.languages[idx];
            this.$i18n.locale = this.selected.value;
            if (!this.isEmpty(sessionStorage.userId)) {
                const localeInfo = {
                    userId: sessionStorage.userId,
                    locale_code: this.selected.value,
                    idx: idx
                };
                localStorage.setItem('locale', JSON.stringify(localeInfo));
            }
        },
        init() {
            if (localStorage.hasOwnProperty('locale') && !this.isEmpty(localStorage.locale)) {
                const selectedLocale = JSON.parse(localStorage.getItem('locale'));
                if (sessionStorage.getItem('userId') === selectedLocale.userId) {
                    this.selected = this.languages[selectedLocale.idx];
                    this.$i18n.locale = this.selected.value;
                }
            }
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
