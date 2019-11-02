<template>
    <div>
        <p-menu-list :list-items="languages"
                     :tooltip="tooltip"
                     @select="changeLanguage"
        >
            <template #activator="{ active }">
                <p-button class="lang-btn" :class="{active: active}">
                    <template>
                        <f-i icon="fa-archive" />
                    </template>
                </p-button>
            </template>
        </p-menu-list>
    </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import PButton from '@/components/atoms/buttons/Button';
import FI from '@/components/atoms/icons/FI';
import PMenuList from '@/components/organisms/lists/menu-list/MenuList';
import { LANGUAGES } from '@/mixins/global-enums';

export default {
    name: 'LanguageMenu',
    components: {
        PButton,
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
    .lang-btn {
        display: inline-block;
        padding: 0;
        border-radius: 2px;
        width: 32px;
        height: 32px;
        color: $primary4;
        &:hover, &.active {
            background-color: $primary-dark;
        }
    }
</style>
