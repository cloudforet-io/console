<template>
    <div>
        <p-menu-list :list-items="languages"
                     @select="changeLanguage"
        >
            <template #contents>
                <p-i name="ic_gnb_language" width="2rem" height="2rem"
                     class="icon" color="transparent inherit"
                />
            </template>
        </p-menu-list>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed, getCurrentInstance, defineComponent, watch,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import PMenuList from '@/components/organisms/lists/menu-list/PMenuList.vue';
import { LANGUAGES } from '@/lib/global-enums';

export default defineComponent({
    name: 'LanguageMenu',
    components: {
        PI,
        PMenuList,
    },
    setup() {
        const vm: any = getCurrentInstance();
        const state = reactive({
            languages: computed(() => vm.$i18n.availableLocales.map(lang => ({
                key: lang,
                contents: LANGUAGES[lang],
                selected: vm.$ls.user.state.language === lang,
            }))),
            // tooltip: computed(() => `Language: ${LANGUAGES[vm.$ls.user.state.language]}`),
        });

        const changeLanguage = async (item?: any) => {
            const lang = item ? item.key : vm.$ls.user.state.language;
            vm.$i18n.locale = lang;
            if (vm.$ls.user.state.language !== lang) {
                await vm.$ls.user.setLanguage(lang);
            }
            // document.getElementsByTagName('HTML')[0].setAttribute('lang', state.language);
        };

        changeLanguage();

        return {
            ...toRefs((state)),
            changeLanguage,
        };
    },
});
</script>

<style lang="postcss" scoped>
    .icon {
        @apply text-primary4;
    }
</style>
