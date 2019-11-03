<template>
    <div>
        <p-menu-list :list-items="languages"
                     :tooltip="tooltip"
                     @select="changeLanguage"
        >
            <template #contents>
                <f-i icon="fa-archive" />
            </template>
        </p-menu-list>
    </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import FI from '@/components/atoms/icons/FI';
import PMenuList from '@/components/organisms/lists/menu-list/MenuList';
import { LANGUAGES } from '@/mixins/global-enums';

export default {
    name: 'LanguageMenu',
    components: {
        FI,
        PMenuList,
    },
    data() {
        return {
            visible: false,
            languages: this.$i18n.availableLocales.map(lang => ({ key: lang, contents: LANGUAGES[lang] })),
        };
    },
    computed: {
        ...mapGetters('user', [
            'locale',
        ]),
        tooltip() {
            return `Language: ${LANGUAGES[this.locale]}`;
        },
    },
    created() {
        this.init();
    },
    methods: {
        ...mapMutations('user', [
            'setLocale',
        ]),
        init() {
            if (this.locale) this.$i18n.locale = this.locale;
        },
        changeLanguage(item) {
            this.setLocale(item.key);
        },
    },
};
</script>

<style lang="scss" scoped>
</style>
