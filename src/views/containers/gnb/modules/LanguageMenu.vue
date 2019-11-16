<template>
    <div>
        <p-menu-list :list-items="languages"
                     :tooltip="tooltip"
                     :tooltip-options="{offset: '20px'}"
                     @select="changeLanguage"
        >
            <template #contents>
                <p-i name="ic_gnb_language" width="32px" height="32px"
                     :color="`transparent ${iconColor}`"
                />
            </template>
        </p-menu-list>
    </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import PI from '@/components/atoms/icons/PI';
import PMenuList from '@/components/organisms/lists/menu-list/MenuList';
import { LANGUAGES } from '@/lib/global-enums';
import styles from '@/styles/_variables.scss';

export default {
    name: 'LanguageMenu',
    components: {
        PI,
        PMenuList,
    },
    data() {
        return {
            visible: false,
            languages: this.$i18n.availableLocales.map(lang => ({ key: lang, contents: LANGUAGES[lang] })),
            iconColor: styles.primary4,
        };
    },
    computed: {
        ...mapGetters('auth', [
            'language',
        ]),
        tooltip() {
            return `Language: ${LANGUAGES[this.language]}`;
        },
    },
    created() {
        this.init();
    },
    methods: {
        ...mapMutations('auth', [
            'setLanguage',
        ]),
        init() {
            if (this.language) this.$i18n.locale = this.language;
        },
        changeLanguage(item) {
            this.setLanguage(item.key);
        },
    },
};
</script>

<style lang="scss" scoped>
</style>
